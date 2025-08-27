from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..services import category_service
from ..database import get_db
from ..auth import get_current_user
from ..dependencies import get_current_org

router = APIRouter(prefix="/categories", tags=["categories"])


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


@router.get("/", response_model=List[schemas.CategoryRead])
def list_categories(
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    categories = category_service.list_categories(
        db, current_user, search=search, skip=skip, limit=limit
    )
    return categories


@router.post("/", response_model=schemas.CategoryRead)
def create_category(
    category_in: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    _ensure_admin(db, current_user, org)
    return category_service.create_category(db, category_in, current_user)


@router.get("/{category_id}", response_model=schemas.CategoryRead)
def get_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    category = category_service.get_category(db, category_id, current_user)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.put("/{category_id}", response_model=schemas.CategoryRead)
def update_category(
    category_id: UUID,
    category_in: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    _ensure_admin(db, current_user, org)
    category = category_service.update_category(db, category_id, category_in, current_user)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return category


@router.delete("/{category_id}")
def delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    _ensure_admin(db, current_user, org)
    success = category_service.delete_category(db, category_id, current_user)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return {"ok": True}
