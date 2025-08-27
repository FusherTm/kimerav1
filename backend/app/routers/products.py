from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..services import product_service
from ..database import get_db
from ..auth import get_current_user
from ..dependencies import get_current_org

router = APIRouter(prefix="/products", tags=["products"])


def _ensure_admin(db: Session, user: models.User, org: models.Organization):
    membership = (
        db.query(models.UserOrganization)
        .filter_by(user_id=user.id, org_id=org.id)
        .first()
    )
    if not membership or membership.role.lower() != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )


@router.get("/", response_model=List[schemas.ProductRead])
def list_products(
    category_id: Optional[UUID] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    products = product_service.list_products(
        db,
        current_user,
        category_id=category_id,
        search=search,
        skip=skip,
        limit=limit,
    )
    return products


@router.post("/", response_model=schemas.ProductRead)
def create_product(
    product_in: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    _ensure_admin(db, current_user, org)
    return product_service.create_product(db, product_in, current_user)


@router.get("/{product_id}", response_model=schemas.ProductRead)
def get_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    product = product_service.get_product(db, product_id, current_user)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=schemas.ProductRead)
def update_product(
    product_id: UUID,
    product_in: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    _ensure_admin(db, current_user, org)
    product = product_service.update_product(db, product_id, product_in, current_user)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    _ensure_admin(db, current_user, org)
    success = product_service.delete_product(db, product_id, current_user)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return {"ok": True}
