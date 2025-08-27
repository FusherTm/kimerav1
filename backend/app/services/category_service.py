from typing import List, Optional
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException

from .. import models, schemas


def create_category(db: Session, category_in: schemas.CategoryCreate, current_user: models.User):
    """Create a new category for the current user's organization."""
    category = models.Category(**category_in.dict(), organization_id=current_user.organization_id)
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def get_category(db: Session, category_id: UUID, current_user: models.User):
    """Return a single category belonging to the current user's organization."""
    return (
        db.query(models.Category)
        .filter(
            models.Category.id == category_id,
            models.Category.organization_id == current_user.organization_id,
        )
        .first()
    )


def list_categories(
    db: Session,
    current_user: models.User,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[models.Category]:
    """List categories for the current user's organization with optional search."""
    query = db.query(models.Category).filter(
        models.Category.organization_id == current_user.organization_id
    )
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(models.Category.name.ilike(like), models.Category.code.ilike(like))
        )
    return query.offset(skip).limit(limit).all()


def update_category(
    db: Session, category_id: UUID, category_in: schemas.CategoryCreate, current_user: models.User
):
    """Update an existing category in the current user's organization."""
    category = get_category(db, category_id, current_user)
    if not category:
        return None
    for field, value in category_in.dict().items():
        setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category_id: UUID, current_user: models.User) -> bool:
    """Delete a category from the current user's organization."""
    category = get_category(db, category_id, current_user)
    if not category:
        return False
    exists_product = (
        db.query(models.Product)
        .filter(models.Product.category_id == category_id)
        .first()
    )
    if exists_product:
        raise HTTPException(
            status_code=409,
            detail="This category cannot be deleted because it is used by existing products.",
        )
    db.delete(category)
    db.commit()
    return True
