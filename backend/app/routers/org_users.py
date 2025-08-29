from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from .. import models
from ..database import get_db
from ..dependencies import get_current_org
from ..auth import get_current_user
from ..core.deps import has_permission
from ..auth import get_password_hash

router = APIRouter(prefix="/org-users", tags=["org-users"])


@router.get("/", response_model=List[Dict[str, Any]])
def list_org_users(
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    _user: models.User = Depends(has_permission("admin:view")),
):
    rows = (
        db.query(models.User, models.UserOrganization)
        .join(models.UserOrganization, models.User.id == models.UserOrganization.user_id)
        .filter(models.UserOrganization.org_id == org.id)
        .all()
    )
    return [{"user_id": str(u.id), "email": u.email, "role": ou.role} for u, ou in rows]


@router.patch("/{user_id}", response_model=Dict[str, Any])
def assign_role(
    user_id: str,
    body: Dict[str, Any],
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    _user: models.User = Depends(has_permission("admin:assign")),
):
    role = body.get("role")
    if not role:
        raise HTTPException(status_code=400, detail="role required")
    ou = (
        db.query(models.UserOrganization)
        .filter(models.UserOrganization.user_id == user_id, models.UserOrganization.org_id == org.id)
        .first()
    )
    if not ou:
        raise HTTPException(status_code=404, detail="user not in org")
    ou.role = role
    db.add(ou)
    db.commit()
    return {"ok": True}


@router.post("/", response_model=Dict[str, Any])
def create_org_user(
    body: Dict[str, Any],
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    _user: models.User = Depends(has_permission("admin:assign")),
):
    email = body.get("email")
    password = body.get("password")
    role = body.get("role") or "viewer"
    if not email or not password:
        raise HTTPException(status_code=400, detail="email and password required")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        user = models.User(email=email, hashed_password=get_password_hash(password), is_active=True)
        db.add(user)
        db.flush()

    ou = (
        db.query(models.UserOrganization)
        .filter(models.UserOrganization.user_id == user.id, models.UserOrganization.org_id == org.id)
        .first()
    )
    if not ou:
        ou = models.UserOrganization(user_id=user.id, org_id=org.id, role=role)
        db.add(ou)
    else:
        ou.role = role
        db.add(ou)

    db.commit()
    return {"ok": True, "user_id": str(user.id)}
