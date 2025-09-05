from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..core.deps import has_permission
from ..dependencies import get_current_org
from ..services import connection_service

router = APIRouter(prefix="/connections", tags=["connections"])


@router.post("/", response_model=schemas.ConnectionRead)
def create_connection(
    body: schemas.ConnectionCreate,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    user=Depends(has_permission("finance:edit")),
):
    try:
        conn = connection_service.create_connection(
            db,
            organization_id=org.id,
            partner_id=body.partner_id,
            total_amount=body.total_amount,
            dt=body.date,
            method=body.method,
            description=body.description,
        )
        # Return as Pydantic model to ensure safe serialization
        return schemas.ConnectionRead.model_validate(conn)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[schemas.ConnectionRead])
def list_connections(
    partner_id: Optional[UUID] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    user=Depends(has_permission("finance:view")),
):
    return connection_service.list_connections(db, organization_id=org.id, partner_id=partner_id, status=status)


@router.get("/orders/{order_id}/application", response_model=Optional[schemas.ConnectionApplicationRead])
def get_order_application(
    order_id: UUID,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    user=Depends(has_permission("order:view")),
):
    return connection_service.get_order_application(db, organization_id=org.id, order_id=order_id)


class ApplyBody(schemas.ConnectionApplicationCreate):
    pass


@router.post("/{connection_id}/apply", response_model=schemas.ConnectionApplicationRead)
def apply_connection(
    connection_id: UUID,
    body: ApplyBody,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    user=Depends(has_permission("order:update")),
):
    if connection_id != body.connection_id:
        raise HTTPException(status_code=400, detail="connection_id mismatch")
    try:
        return connection_service.apply_connection(
            db,
            organization_id=org.id,
            connection_id=connection_id,
            order_id=body.order_id,
            amount=body.amount,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to apply connection")
