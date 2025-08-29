from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_org
from .common import get_crud_router
from ..core.deps import has_permission

router = get_crud_router(models.PurchaseOrder, schemas.PurchaseOrderRead, schemas.PurchaseOrderCreate, "/purchase_orders")


@router.post("/{po_id}/post", response_model=schemas.FinancialTransactionRead)
def post_purchase_order(
    po_id: str,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    user=Depends(has_permission("purchase:update")),
):
    po = (
        db.query(models.PurchaseOrder)
        .filter(models.PurchaseOrder.id == po_id, models.PurchaseOrder.organization_id == org.id)
        .first()
    )
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    if not po.partner_id:
        raise HTTPException(status_code=400, detail="Purchase order has no supplier")

    amount = po.grand_total or 0
    tx = models.FinancialTransaction(
        organization_id=org.id,
        account_id=None,
        partner_id=po.partner_id,
        order_id=None,
        purchase_order_id=po.id,
        direction=models.TransactionDirection.IN,  # positive posting; classification handled downstream
        amount=amount,
        transaction_date=date.today(),
        description=f"Purchase {po.po_number or ''}".strip(),
        method="PURCHASE",
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx
