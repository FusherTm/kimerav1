from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from .. import models
from . import __init__  # keep package import context


def list_assets(db: Session, org_id) -> List[models.Asset]:
    return db.query(models.Asset).filter(models.Asset.organization_id == org_id).all()


def get_asset(db: Session, org_id, asset_id) -> Optional[models.Asset]:
    return (
        db.query(models.Asset)
        .filter(models.Asset.organization_id == org_id, models.Asset.id == asset_id)
        .first()
    )


def create_asset(db: Session, org_id, name: str, asset_type: str, acquisition_date, current_value, status: Optional[str], details: Dict[str, Any]) -> models.Asset:
    asset = models.Asset(
        organization_id=org_id,
        name=name,
        asset_type=asset_type,
        acquisition_date=acquisition_date,
        current_value=current_value,
        status=status,
    )
    db.add(asset)
    db.flush()  # get asset.id

    t = (asset_type or '').upper()
    if t == 'VEHICLE':
        db.add(models.AssetDetailVehicle(
            asset_id=asset.id,
            license_plate=details.get('license_plate'),
            make=details.get('make'),
            model=details.get('model'),
            year=details.get('year'),
        ))
    elif t == 'REAL_ESTATE':
        db.add(models.AssetDetailRealEstate(
            asset_id=asset.id,
            property_type=details.get('property_type'),
            address=details.get('address'),
            parcel_info=details.get('parcel_info'),
        ))
    elif t == 'CHECK':
        # Sync base status with check detail status if provided
        if not asset.status and details.get('status') is not None:
            asset.status = details.get('status')
        db.add(models.AssetDetailCheck(
            asset_id=asset.id,
            partner_id=details.get('partner_id'),
            check_number=details.get('check_number'),
            due_date=details.get('due_date'),
            amount=details.get('amount'),
            status=details.get('status'),
            bank_name=details.get('bank_name'),
            bank_branch=details.get('bank_branch'),
            given_to_partner_id=details.get('given_to_partner_id'),
            given_to_name=details.get('given_to_name'),
        ))
    else:
        # unknown type -> no detail table, still allow base asset
        pass

    db.commit()
    db.refresh(asset)
    return asset


def delete_asset(db: Session, org_id, asset_id) -> bool:
    asset = get_asset(db, org_id, asset_id)
    if not asset:
        return False
    # Ensure detail rows are removed first to avoid FK constraint errors
    db.query(models.AssetDetailVehicle).filter(models.AssetDetailVehicle.asset_id == asset.id).delete(synchronize_session=False)
    db.query(models.AssetDetailRealEstate).filter(models.AssetDetailRealEstate.asset_id == asset.id).delete(synchronize_session=False)
    db.query(models.AssetDetailCheck).filter(models.AssetDetailCheck.asset_id == asset.id).delete(synchronize_session=False)
    db.delete(asset)
    db.commit()
    return True


def update_check_status(
    db: Session,
    org_id,
    asset_id,
    status: str,
    given_to_partner_id=None,
    given_to_name: Optional[str] = None,
) -> Optional[models.Asset]:
    asset = get_asset(db, org_id, asset_id)
    if not asset:
        return None
    # ensure it's a CHECK type
    if (asset.asset_type or '').upper() != 'CHECK':
        return None
    detail = (
        db.query(models.AssetDetailCheck)
        .filter(models.AssetDetailCheck.asset_id == asset.id)
        .first()
    )
    if not detail:
        # create detail if missing
        detail = models.AssetDetailCheck(asset_id=asset.id, status=status)
        db.add(detail)
    else:
        detail.status = status
        if status == 'USED':
            detail.given_to_partner_id = given_to_partner_id
            # If explicit name not provided but a partner is selected, use partner name
            if given_to_name:
                detail.given_to_name = given_to_name
            elif given_to_partner_id is not None:
                p = db.query(models.Partner).filter(models.Partner.id == given_to_partner_id).first()
                if p:
                    detail.given_to_name = p.name
        db.add(detail)
    # keep base asset status in sync for listing convenience
    asset.status = status
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset
