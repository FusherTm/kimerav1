from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..services import partner_service
from ..database import get_db
from ..auth import get_current_user
from ..dependencies import get_current_org
from ..core.deps import has_permission

router = APIRouter(prefix="/partners", tags=["partners"])


@router.get("/", response_model=List[schemas.PartnerRead])
def list_partners(
    partner_type: Optional[schemas.PartnerType] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(has_permission("partner:view")),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    partners = partner_service.list_partners(
        db,
        current_user,
        partner_type=partner_type,
        is_active=is_active,
        search=search,
        skip=skip,
        limit=limit,
    )
    return partners


@router.post("/", response_model=schemas.PartnerRead)
def create_partner(
    partner_in: schemas.PartnerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(has_permission("partner:create")),
):
    return partner_service.create_partner(db, partner_in, current_user)


@router.get("/{partner_id}", response_model=schemas.PartnerRead)
def get_partner(
    partner_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(has_permission("partner:view")),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    partner = partner_service.get_partner(db, partner_id, current_user)
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    return partner


@router.put("/{partner_id}", response_model=schemas.PartnerRead)
def update_partner(
    partner_id: UUID,
    partner_in: schemas.PartnerCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(has_permission("partner:update")),
):
    partner = partner_service.update_partner(db, partner_id, partner_in, current_user)
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    return partner


@router.delete("/{partner_id}")
def delete_partner(
    partner_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(has_permission("partner:delete")),
):
    success = partner_service.delete_partner(db, partner_id, current_user)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Partner not found")
    return {"ok": True}


# New: partner-related resources (orders and statement)
from pydantic import BaseModel
from sqlalchemy import func
import sqlalchemy as sa
from datetime import datetime, date


@router.get("/{partner_id}/orders", response_model=List[schemas.OrderRead])
def list_partner_orders(
    partner_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(has_permission("partner:view")),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    orders = (
        db.query(models.Order)
        .filter(
            models.Order.organization_id == org.id,
            models.Order.partner_id == partner_id,
        )
        .order_by(models.Order.order_date.desc())
        .all()
    )
    return orders


class StatementItem(BaseModel):
    id: UUID
    transaction_date: Optional[datetime] | None = None  # type: ignore[name-defined]
    direction: schemas.TransactionDirection
    amount: float
    description: Optional[str] | None = None
    document_name: Optional[str] | None = None  # e.g., order.project_name or order_number
    method: Optional[str] | None = None
    area_sqm: Optional[float] | None = None


class StatementSummary(BaseModel):
    incoming: float  # payments received from partner (cash in)
    outgoing: float  # payments made to partner (cash out)
    balance: float   # partner receivable balance


class PartnerStatementResponse(BaseModel):
    items: List[StatementItem]
    summary: StatementSummary


@router.get("/{partner_id}/statement", response_model=PartnerStatementResponse)
def get_partner_statement(
    partner_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(has_permission("partner:view")),
    org: models.Organization = Depends(get_current_org),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
):
    current_user.organization_id = org.id
    # Precompute total area per sales order (sum of item areas in m^2)
    area_expr = func.coalesce(
        models.OrderItem.area_sqm,
        (sa.cast(models.OrderItem.width, sa.Numeric()) / 1000)
        * (sa.cast(models.OrderItem.height, sa.Numeric()) / 1000)
        * sa.cast(func.coalesce(models.OrderItem.quantity, 0), sa.Numeric()),
    )
    order_area_sq = (
        db.query(
            models.OrderItem.order_id.label("order_id"),
            func.sum(area_expr).label("total_area_sqm"),
        )
        .group_by(models.OrderItem.order_id)
        .subquery()
    )

    q = (
        db.query(
            models.FinancialTransaction,
            models.Order,
            models.PurchaseOrder,
            order_area_sq.c.total_area_sqm,
        )
        .outerjoin(models.Order, models.Order.id == models.FinancialTransaction.order_id)
        .outerjoin(models.PurchaseOrder, models.PurchaseOrder.id == models.FinancialTransaction.purchase_order_id)
        .outerjoin(order_area_sq, order_area_sq.c.order_id == models.Order.id)
        .filter(
            models.FinancialTransaction.organization_id == org.id,
            models.FinancialTransaction.partner_id == partner_id,
        )
    )
    if start_date is not None:
        q = q.filter(models.FinancialTransaction.transaction_date >= start_date)
    if end_date is not None:
        q = q.filter(models.FinancialTransaction.transaction_date <= end_date)
    rows = q.order_by(models.FinancialTransaction.transaction_date.desc().nullslast()).all()

    items: List[StatementItem] = []
    payments_in = 0.0     # cash received from partner
    payments_out = 0.0    # cash paid to partner (refunds, etc.)
    postings_total = 0.0  # posted amounts from orders/purchases increasing balance

    for t, order, po, total_area in rows:
        amt = float(t.amount or 0)
        # Classify
        if (t.method or "").upper() in ("ORDER", "PURCHASE"):
            # Posted document (sales or purchase): increases balance
            postings_total += amt
        else:
            if t.direction == models.TransactionDirection.IN:
                payments_in += amt
            else:
                payments_out += amt

        doc_name = None
        if order is not None:
            doc_name = getattr(order, "project_name", None) or getattr(order, "order_number", None)
        elif po is not None:
            doc_name = getattr(po, "po_number", None)
        items.append(
            StatementItem(
                id=t.id,
                transaction_date=t.transaction_date,
                direction=t.direction.value if hasattr(t.direction, "value") else t.direction,
                amount=amt,
                description=t.description,
                document_name=doc_name,
                method=t.method,
                area_sqm=float(total_area) if total_area is not None else None,
            )
        )

    balance = postings_total - payments_in - payments_out
    summary = StatementSummary(incoming=payments_in, outgoing=payments_out, balance=balance)
    return PartnerStatementResponse(items=items, summary=summary)

