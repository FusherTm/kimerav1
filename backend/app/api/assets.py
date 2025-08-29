from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_org
from ..auth import get_current_user
from ..services.asset_service import list_assets, get_asset, create_asset, delete_asset, update_check_status

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get('/', response_model=List[schemas.AssetRead])
def list_all(db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), user=Depends(get_current_user)):
    return list_assets(db, org.id)


@router.get('/{asset_id}', response_model=schemas.AssetRead)
def get_one(asset_id: UUID, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), user=Depends(get_current_user)):
    a = get_asset(db, org.id, asset_id)
    if not a:
        raise HTTPException(status_code=404, detail='Asset not found')
    return a


@router.post('/', response_model=schemas.AssetRead)
def create(a_in: schemas.AssetCreate, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), user=Depends(get_current_user)):
    return create_asset(
        db,
        org.id,
        name=a_in.name,
        asset_type=a_in.asset_type,
        acquisition_date=a_in.acquisition_date,
        current_value=a_in.current_value,
        status=a_in.status,
        details=a_in.details or {},
    )


@router.delete('/{asset_id}')
def remove(asset_id: UUID, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), user=Depends(get_current_user)):
    ok = delete_asset(db, org.id, asset_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Asset not found')
    return { 'ok': True }


@router.patch('/{asset_id}/check-status', response_model=schemas.AssetRead)
def patch_check_status(asset_id: UUID, body: schemas.AssetCheckStatusUpdate, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), user=Depends(get_current_user)):
    asset = update_check_status(
        db, org.id, asset_id,
        status=body.status,
        given_to_partner_id=body.given_to_partner_id,
        given_to_name=body.given_to_name,
    )
    if not asset:
        raise HTTPException(status_code=404, detail='Asset not found or not a check')
    return asset
