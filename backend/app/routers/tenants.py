from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from .. import models
from ..database import get_db
from ..core.deps import has_permission
from ..auth import get_password_hash, get_current_user

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.post('/', response_model=Dict[str, Any])
def create_tenant(
    body: Dict[str, Any],
    db: Session = Depends(get_db),
    _user: models.User = Depends(has_permission("admin:update")),
):
    name = body.get('name')
    slug = body.get('slug')
    admin_email = body.get('admin_email')
    admin_password = body.get('admin_password')
    if not name or not slug:
        raise HTTPException(status_code=400, detail='name and slug required')

    org = db.query(models.Organization).filter(models.Organization.slug == slug).first()
    if org:
        raise HTTPException(status_code=409, detail='organization exists')
    org = models.Organization(name=name, slug=slug)
    db.add(org)
    db.flush()

    user = None
    if admin_email and admin_password:
        user = db.query(models.User).filter(models.User.email == admin_email).first()
        if not user:
            user = models.User(email=admin_email, hashed_password=get_password_hash(admin_password), is_active=True)
            db.add(user)
            db.flush()
        ou = db.query(models.UserOrganization).filter_by(user_id=user.id, org_id=org.id).first()
        if not ou:
            db.add(models.UserOrganization(user_id=user.id, org_id=org.id, role='admin'))

    db.commit()
    return { 'id': str(org.id), 'name': org.name, 'slug': org.slug, 'admin_user_id': (str(user.id) if user else None) }

