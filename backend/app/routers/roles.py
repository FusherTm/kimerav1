from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from .. import models
from ..database import get_db
from ..dependencies import get_current_org
from ..auth import get_current_user
from ..core.deps import has_permission

router = APIRouter(prefix="/roles", tags=["roles"])


@router.get("/", response_model=List[Dict[str, Any]])
def list_roles(
    db: Session = Depends(get_db),
    _org: models.Organization = Depends(get_current_org),
    _user: models.User = Depends(has_permission("admin:view")),
):
    rows = db.query(models.Role).all()
    return [{"name": r.name, "permissions": r.permissions} for r in rows]


@router.post("/", response_model=Dict[str, Any])
def create_role(
    body: Dict[str, Any],
    db: Session = Depends(get_db),
    _org: models.Organization = Depends(get_current_org),
    _user: models.User = Depends(has_permission("admin:update")),
):
    name = body.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="name required")
    existing = db.query(models.Role).filter_by(name=name).first()
    if existing:
        raise HTTPException(status_code=409, detail="role exists")
    r = models.Role(name=name, permissions=body.get("permissions") or {})
    db.add(r)
    db.commit()
    db.refresh(r)
    return {"name": r.name, "permissions": r.permissions}


@router.put("/{name}", response_model=Dict[str, Any])
def update_role(
    name: str,
    body: Dict[str, Any],
    db: Session = Depends(get_db),
    _org: models.Organization = Depends(get_current_org),
    _user: models.User = Depends(has_permission("admin:update")),
):
    r = db.query(models.Role).filter_by(name=name).first()
    if not r:
        raise HTTPException(status_code=404, detail="role not found")
    perms = body.get("permissions")
    if perms is not None:
        r.permissions = perms
    db.add(r)
    db.commit()
    db.refresh(r)
    return {"name": r.name, "permissions": r.permissions}


@router.delete("/{name}")
def delete_role(
    name: str,
    db: Session = Depends(get_db),
    _org: models.Organization = Depends(get_current_org),
    _user: models.User = Depends(has_permission("admin:update")),
):
    r = db.query(models.Role).filter_by(name=name).first()
    if not r:
        raise HTTPException(status_code=404, detail="role not found")
    db.delete(r)
    db.commit()
    return {"ok": True}

