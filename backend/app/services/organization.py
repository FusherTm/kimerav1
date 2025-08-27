from sqlalchemy.orm import Session
from .. import models, schemas


def create_org(db: Session, org_in: schemas.OrganizationCreate):
    org = models.Organization(**org_in.dict())
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


def list_orgs(db: Session):
    return db.query(models.Organization).all()
