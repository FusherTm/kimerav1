from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .. import models, schemas
from ..services import order_service
from ..database import get_db
from ..auth import get_current_user
from ..dependencies import get_current_org
from ..core.deps import has_permission
from typing import Optional

router = APIRouter(prefix="/orders", tags=["orders"])


class StatusUpdate(BaseModel):
    status: str


@router.post("/", response_model=schemas.OrderDetail)
def create_order(
    order_in: schemas.OrderCreateWithItems,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(has_permission("order:create")),
):
    order = order_service.create_order(db, order_in, current_user)
    order_db, items = order_service.get_order(db, order.id, current_user)
    if not order_db:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return schemas.OrderDetail(
        **schemas.OrderRead.from_orm(order_db).dict(),
        items=[schemas.OrderItemRead.from_orm(i) for i in items],
    )


@router.get("/", response_model=List[schemas.OrderRead])
def list_orders(
    status: Optional[str] = None,
    partner_id: Optional[UUID] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    orders = order_service.list_orders(
        db,
        current_user,
        status=status,
        partner_id=partner_id,
        skip=skip,
        limit=limit,
    )
    return orders


@router.get("/{order_id}", response_model=schemas.OrderDetail)
def get_order(
    order_id: UUID,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    org: models.Organization = Depends(get_current_org),
):
    current_user.organization_id = org.id
    order, items = order_service.get_order(db, order_id, current_user)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return schemas.OrderDetail(
        **schemas.OrderRead.from_orm(order).dict(),
        items=[schemas.OrderItemRead.from_orm(i) for i in items],
    )


@router.post("/{order_id}/status", response_model=schemas.OrderRead)
def change_status(
    order_id: UUID,
    status_in: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(has_permission("order:update")),
):
    order = order_service.update_order_status(db, order_id, status_in.status, current_user)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order
