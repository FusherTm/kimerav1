from datetime import date
from decimal import Decimal
from typing import List, Optional, Tuple
from uuid import UUID

from sqlalchemy.orm import Session

from .. import models, schemas


def _generate_order_number(db: Session, org_id: UUID, order_date: date) -> str:
    """Generate sequential order number like '2025-001' per organization per year."""
    year = order_date.year
    prefix = f"{year}-"
    last_order = (
        db.query(models.Order)
        .filter(
            models.Order.organization_id == org_id,
            models.Order.order_number.like(f"{prefix}%"),
        )
        .order_by(models.Order.order_number.desc())
        .first()
    )
    seq = 1
    if last_order and last_order.order_number:
        try:
            seq = int(last_order.order_number.split("-")[1]) + 1
        except Exception:
            seq = 1
    return f"{year}-{seq:03d}"


def create_order(
    db: Session, order_in: schemas.OrderCreateWithItems, current_user: models.User
) -> models.Order:
    """Create an order with items for the current organization."""
    ord_date = order_in.order_date or date.today()
    order_number = _generate_order_number(db, current_user.organization_id, ord_date)

    order = models.Order(
        organization_id=current_user.organization_id,
        partner_id=order_in.partner_id,
        project_name=order_in.project_name,
        order_number=order_number,
        status=order_in.status or "DRAFT",
        order_date=ord_date,
        delivery_date=order_in.delivery_date,
        delivery_method=order_in.delivery_method,
        notes=order_in.notes,
        grand_total=Decimal("0"),
        discount_percent=getattr(order_in, 'discount_percent', None),
        vat_inclusive=bool(getattr(order_in, 'vat_inclusive', False)),
    )
    with db.begin():
        db.add(order)
        db.flush()  # obtain order.id

        grand_total = Decimal("0")
        for item_in in order_in.items:
            unit_price = Decimal(item_in.unit_price or 0)

            # Support either explicit area (m^2) or width/height/quantity
            if getattr(item_in, "area_sqm", None) is not None:
                area_m2 = Decimal(item_in.area_sqm)
                quantity = item_in.quantity or 1  # default 1 for area-only items
            else:
                width_m = Decimal(item_in.width or 0) / Decimal(1000)
                height_m = Decimal(item_in.height or 0) / Decimal(1000)
                quantity = item_in.quantity or 0
                area_m2 = width_m * height_m * quantity

            total_price = area_m2 * unit_price
            grand_total += total_price

            order_item = models.OrderItem(
                organization_id=current_user.organization_id,
                order_id=order.id,
                product_id=item_in.product_id,
                description=item_in.description,
                area_sqm=getattr(item_in, "area_sqm", None),
                width=item_in.width,
                height=item_in.height,
                quantity=quantity,
                unit_price=unit_price,
                total_price=total_price,
                notes=item_in.notes,
            )
            db.add(order_item)

        order.grand_total = grand_total

        # If created directly as SIPARIS (confirmed), post receivable transaction
        if (order.status or "").upper() == "SIPARIS" and order.partner_id is not None:
            tx = models.FinancialTransaction(
                organization_id=current_user.organization_id,
                account_id=None,
                partner_id=order.partner_id,
                order_id=order.id,
                purchase_order_id=None,
                direction=models.TransactionDirection.IN,
                amount=order.grand_total or 0,
                transaction_date=date.today(),
                description=f"Order {order.order_number}",
                method="ORDER",
            )
            db.add(tx)
    db.refresh(order)
    return order


def update_order_pricing(
    db: Session, order_id: UUID, current_user: models.User, *, discount_percent=None, vat_inclusive=None
) -> Optional[models.Order]:
    order = (
        db.query(models.Order)
        .filter(
            models.Order.id == order_id,
            models.Order.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not order:
        return None
    changed = False
    if discount_percent is not None:
        order.discount_percent = discount_percent
        changed = True
    if vat_inclusive is not None:
        order.vat_inclusive = bool(vat_inclusive)
        changed = True
    if changed:
        db.add(order)
        db.commit()
        db.refresh(order)
    return order


def update_order_status(
    db: Session, order_id: UUID, status: str, current_user: models.User
) -> Optional[models.Order]:
    order = (
        db.query(models.Order)
        .filter(
            models.Order.id == order_id,
            models.Order.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not order:
        return None
    previous_status = order.status
    order.status = status
    with db.begin():
        db.add(order)

        if status == "URETIMDE":
            items = (
                db.query(models.OrderItem)
                .filter(
                    models.OrderItem.order_id == order.id,
                    models.OrderItem.organization_id == current_user.organization_id,
                )
                .all()
            )
            for idx, item in enumerate(items, start=1):
                job = models.ProductionJob(
                    organization_id=current_user.organization_id,
                    order_item_id=item.id,
                    job_number=f"{order.order_number}-{idx:03d}",
                    status="PENDING",
                    quantity_required=item.quantity,
                    quantity_produced=0,
                )
                db.add(job)

        # If moving to SIPARIS, record receivable transaction in same DB tx
        if previous_status != "SIPARIS" and status == "SIPARIS":
            if order.partner_id is not None:
                tx = models.FinancialTransaction(
                    organization_id=current_user.organization_id,
                    account_id=None,
                    partner_id=order.partner_id,
                    order_id=order.id,
                    purchase_order_id=None,
                    direction=models.TransactionDirection.IN,
                    amount=order.grand_total or 0,
                    transaction_date=date.today(),
                    description=f"Order {order.order_number}",
                    method="ORDER",
                )
                db.add(tx)
    db.refresh(order)
    return order


def list_orders(
    db: Session,
    current_user: models.User,
    status: Optional[str] = None,
    partner_id: Optional[UUID] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[models.Order]:
    query = db.query(models.Order).filter(
        models.Order.organization_id == current_user.organization_id
    )
    if status:
        query = query.filter(models.Order.status == status)
    if partner_id:
        query = query.filter(models.Order.partner_id == partner_id)
    if search:
        s = f"%{search}%"
        # Filter by order_number, project_name, or partner name
        query = (
            query.outerjoin(models.Partner, models.Partner.id == models.Order.partner_id)
            .filter(
                (models.Order.order_number.ilike(s))
                | (models.Order.project_name.ilike(s))
                | (models.Partner.name.ilike(s))
            )
        )
    return (
        query.order_by(models.Order.order_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_order(
    db: Session, order_id: UUID, current_user: models.User
) -> Tuple[Optional[models.Order], List[models.OrderItem]]:
    order = (
        db.query(models.Order)
        .filter(
            models.Order.id == order_id,
            models.Order.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not order:
        return None, []
    items = (
        db.query(models.OrderItem)
        .filter(
            models.OrderItem.order_id == order.id,
            models.OrderItem.organization_id == current_user.organization_id,
        )
        .all()
    )
    return order, items
