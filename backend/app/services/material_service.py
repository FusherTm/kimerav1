from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from .. import models, schemas


def create_material(db: Session, material_in: schemas.MaterialCreate, organization_id: UUID) -> models.Material:
    obj = models.Material(
        organization_id=organization_id,
        name=material_in.name,
        sku=material_in.sku,
        stock_quantity=material_in.stock_quantity,
        unit=material_in.unit,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def list_materials(db: Session, organization_id: UUID, skip: int = 0, limit: int = 100) -> List[models.Material]:
    return (
        db.query(models.Material)
        .filter(models.Material.organization_id == organization_id)
        .order_by(models.Material.name.asc())
        .offset(int(skip))
        .limit(int(limit))
        .all()
    )


def get_material(db: Session, material_id: UUID, organization_id: UUID) -> Optional[models.Material]:
    return (
        db.query(models.Material)
        .filter(models.Material.id == material_id, models.Material.organization_id == organization_id)
        .first()
    )


def update_material(
    db: Session, material_id: UUID, organization_id: UUID, material_in: schemas.MaterialUpdate
) -> Optional[models.Material]:
    obj = get_material(db, material_id, organization_id)
    if not obj:
        return None
    data = material_in.dict(exclude_unset=True)
    for k, v in data.items():
        setattr(obj, k, v)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def delete_material(db: Session, material_id: UUID, organization_id: UUID) -> bool:
    obj = get_material(db, material_id, organization_id)
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True
