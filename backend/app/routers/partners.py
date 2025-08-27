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
    current_user: models.User = Depends(get_current_user),
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
    current_user: models.User = Depends(get_current_user),
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
