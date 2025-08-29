from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_org

router = APIRouter(prefix="/purchase_order_items", tags=["purchase_order_items"])


@router.post('/', response_model=schemas.PurchaseOrderItemRead)
def create_item(
    item_in: schemas.PurchaseOrderItemCreate,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
):
    po = (
        db.query(models.PurchaseOrder)
        .filter(models.PurchaseOrder.id == item_in.purchase_order_id)
        .filter(models.PurchaseOrder.organization_id == org.id)
        .first()
    )
    if not po:
        raise HTTPException(status_code=404, detail="Purchase order not found or not in organization")

    obj = models.PurchaseOrderItem(**item_in.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get('/', response_model=list[schemas.PurchaseOrderItemRead])
def list_items(
    purchase_order_id: str,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
):
    # List items for a PO under the same organization
    q = (
        db.query(models.PurchaseOrderItem)
        .join(models.PurchaseOrder, models.PurchaseOrder.id == models.PurchaseOrderItem.purchase_order_id)
        .filter(models.PurchaseOrder.organization_id == org.id)
        .filter(models.PurchaseOrder.id == purchase_order_id)
    )
    return q.all()
