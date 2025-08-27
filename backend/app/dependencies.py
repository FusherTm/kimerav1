from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session
from .database import get_db
from . import models
from .auth import get_current_active_user

async def get_current_org(x_org_slug: str = Header(..., alias="X-Org-Slug"),
                          current_user: models.User = Depends(get_current_active_user),
                          db: Session = Depends(get_db)):
    org = db.query(models.Organization).filter(models.Organization.slug == x_org_slug).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    membership = db.query(models.UserOrganization).filter_by(user_id=current_user.id, org_id=org.id).first()
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this organization")
    return org
