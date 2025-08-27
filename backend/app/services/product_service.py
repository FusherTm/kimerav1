from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import or_

from .. import models, schemas


def create_product(db: Session, product_in: schemas.ProductCreate, current_user: models.User):
    """Create a new product for the current user's organization."""
    product = models.Product(**product_in.dict(), organization_id=current_user.organization_id)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_product(db: Session, product_id: UUID, current_user: models.User):
    """Return a single product belonging to the current user's organization."""
    return (
        db.query(models.Product)
        .filter(
            models.Product.id == product_id,
            models.Product.organization_id == current_user.organization_id,
        )
        .first()
    )


def list_products(
    db: Session,
    current_user: models.User,
    category_id: Optional[UUID] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[models.Product]:
    """List products for the current user's organization with optional filters."""
    query = db.query(models.Product).filter(
        models.Product.organization_id == current_user.organization_id
    )
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(models.Product.name.ilike(like), models.Product.sku.ilike(like))
        )
    return query.offset(skip).limit(limit).all()


def update_product(
    db: Session, product_id: UUID, product_in: schemas.ProductCreate, current_user: models.User
):
    """Update an existing product in the current user's organization."""
    product = get_product(db, product_id, current_user)
    if not product:
        return None
    for field, value in product_in.dict().items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: UUID, current_user: models.User) -> bool:
    """Delete a product from the current user's organization."""
    product = get_product(db, product_id, current_user)
    if not product:
        return False
    db.delete(product)
    db.commit()
    return True
