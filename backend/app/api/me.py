from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models
from ..database import get_db
from ..dependencies import get_current_org
from ..auth import get_current_user

router = APIRouter(prefix="/me", tags=["me"])


@router.get("/permissions")
def my_permissions(
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    user: models.User = Depends(get_current_user),
):
    membership = (
        db.query(models.UserOrganization)
        .filter_by(user_id=user.id, org_id=org.id)
        .first()
    )
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member")
    role_name = membership.role
    role = db.query(models.Role).filter_by(name=role_name).first()
    perms = role.permissions if role and role.permissions else {}
    is_admin = role_name == 'admin'
    return {
        'organization': {'id': str(org.id), 'name': org.name, 'slug': org.slug},
        'role': role_name,
        'is_admin': is_admin,
        'permissions': perms,
        'user': {'id': str(user.id), 'email': user.email},
    }

