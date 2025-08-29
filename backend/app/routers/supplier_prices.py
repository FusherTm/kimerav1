from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_org

router = APIRouter(prefix="/supplier_prices", tags=["supplier_prices"])


@router.post('/', response_model=schemas.SupplierPriceRead)
def create_supplier_price(
    item_in: schemas.SupplierPriceCreate,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
):
    # upsert by unique (org, supplier, product)
    existing = (
        db.query(models.SupplierPrice)
        .filter(models.SupplierPrice.organization_id == org.id)
        .filter(models.SupplierPrice.supplier_id == item_in.supplier_id)
        .filter(models.SupplierPrice.product_id == item_in.product_id)
        .first()
    )
    if existing:
        existing.unit_price = item_in.unit_price
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    obj = models.SupplierPrice(
        organization_id=org.id,
        supplier_id=item_in.supplier_id,
        product_id=item_in.product_id,
        unit_price=item_in.unit_price,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get('/search', response_model=schemas.SupplierPriceRead)
def get_supplier_price(
    supplier_id: str,
    product_id: str,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
):
    obj = (
        db.query(models.SupplierPrice)
        .filter(models.SupplierPrice.organization_id == org.id)
        .filter(models.SupplierPrice.supplier_id == supplier_id)
        .filter(models.SupplierPrice.product_id == product_id)
        .first()
    )
    if not obj:
        raise HTTPException(status_code=404, detail="No price found")
    return obj

