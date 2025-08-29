from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_org
from ..auth import get_current_user
from ..core.deps import has_permission
from ..services import material_service

router = APIRouter(prefix="/materials", tags=["materials"])


@router.post('/', response_model=schemas.MaterialRead)
def create_material(
    material_in: schemas.MaterialCreate,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    user=Depends(has_permission("material:create")),
):
    return material_service.create_material(db, material_in, org.id)


@router.get('/', response_model=List[schemas.MaterialRead])
def list_materials(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    user=Depends(has_permission("material:view")),
):
    return material_service.list_materials(db, org.id, skip=skip, limit=limit)


@router.put('/{material_id}', response_model=schemas.MaterialRead)
def update_material(
    material_id: UUID,
    material_in: schemas.MaterialUpdate,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    user=Depends(has_permission("material:update")),
):
    obj = material_service.update_material(db, material_id, org.id, material_in)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    return obj


@router.delete('/{material_id}')
def delete_material(
    material_id: UUID,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    user=Depends(has_permission("material:delete")),
):
    ok = material_service.delete_material(db, material_id, org.id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material not found")
    return {"ok": True}
