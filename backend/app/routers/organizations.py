from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas
from ..services import organization as service
from ..database import get_db

router = APIRouter(prefix="/organizations", tags=["organizations"])

@router.post('/', response_model=schemas.OrganizationRead)
def create_org(org_in: schemas.OrganizationCreate, db: Session = Depends(get_db)):
    return service.create_org(db, org_in)

@router.get('/', response_model=list[schemas.OrganizationRead])
def list_orgs(db: Session = Depends(get_db)):
    return service.list_orgs(db)
