from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException

from .. import models, schemas


def create_partner(db: Session, partner_in: schemas.PartnerCreate, current_user: models.User):
    """Create a new partner for the current user's organization."""
    partner = models.Partner(**partner_in.dict(), organization_id=current_user.organization_id)
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner


def get_partner(db: Session, partner_id: UUID, current_user: models.User):
    """Return a single partner belonging to the current user's organization."""
    return (
        db.query(models.Partner)
        .filter(
            models.Partner.id == partner_id,
            models.Partner.organization_id == current_user.organization_id,
        )
        .first()
    )


def list_partners(
    db: Session,
    current_user: models.User,
    partner_type: Optional[models.PartnerType] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
) -> List[models.Partner]:
    """List partners for the current user's organization with optional filters."""
    query = db.query(models.Partner).filter(
        models.Partner.organization_id == current_user.organization_id
    )
    if partner_type:
        query = query.filter(models.Partner.type == partner_type)
    if is_active is not None:
        query = query.filter(models.Partner.is_active == is_active)
    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                models.Partner.name.ilike(like),
                models.Partner.email.ilike(like),
                models.Partner.phone.ilike(like),
            )
        )
    return query.offset(skip).limit(limit).all()


def update_partner(
    db: Session, partner_id: UUID, partner_in: schemas.PartnerCreate, current_user: models.User
):
    """Update an existing partner in the current user's organization."""
    partner = get_partner(db, partner_id, current_user)
    if not partner:
        return None
    for field, value in partner_in.dict().items():
        setattr(partner, field, value)
    db.commit()
    db.refresh(partner)
    return partner


def delete_partner(db: Session, partner_id: UUID, current_user: models.User) -> bool:
    """Delete a partner from the current user's organization."""
    partner = get_partner(db, partner_id, current_user)
    if not partner:
        return False
    exists_order = (
        db.query(models.Order)
        .filter(models.Order.partner_id == partner_id)
        .first()
    )
    if exists_order:
        raise HTTPException(
            status_code=409,
            detail="This partner cannot be deleted because they have existing orders.",
        )
    db.delete(partner)
    db.commit()
    return True
