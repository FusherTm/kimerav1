from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..auth import get_current_user
from ..dependencies import get_current_org
from ..database import get_db
from .. import models


def has_permission(permission_name: str):
    """Dependency factory that ensures the current user has a specific permission."""

    def dependency(
        current_user: models.User = Depends(get_current_user),
        org: models.Organization = Depends(get_current_org),
        db: Session = Depends(get_db),
    ) -> models.User:
        membership = (
            db.query(models.UserOrganization)
            .filter_by(user_id=current_user.id, org_id=org.id)
            .first()
        )
        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not a member of this organization",
            )
        # Admin shortcut: role name 'admin' has full access
        if membership.role == 'admin':
            current_user.organization_id = org.id
            return current_user

        role = db.query(models.Role).filter_by(name=membership.role).first()
        if not role or not role.permissions or not role.permissions.get(permission_name):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        current_user.organization_id = org.id
        return current_user

    return dependency
