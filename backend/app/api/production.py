from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from .. import models
from ..database import get_db
from ..dependencies import get_current_org

router = APIRouter(prefix="/production", tags=["production"])


class ActiveJob(BaseModel):
    id: UUID
    status: str
    order_number: str | None = None
    partner_name: str | None = None
    product_name: str | None = None
    width: int | None = None
    height: int | None = None
    quantity: int | None = None

    class Config:
        orm_mode = True


class StatusUpdate(BaseModel):
    status: str


@router.get("/active-jobs", response_model=List[ActiveJob])
def get_active_jobs(
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
):
    rows = (
        db.query(
            models.ProductionJob,
            models.Order,
            models.Partner,
            models.Product,
            models.OrderItem,
        )
        .join(models.OrderItem, models.ProductionJob.order_item_id == models.OrderItem.id)
        .join(models.Order, models.OrderItem.order_id == models.Order.id)
        .outerjoin(models.Partner, models.Order.partner_id == models.Partner.id)
        .outerjoin(models.Product, models.OrderItem.product_id == models.Product.id)
        .filter(models.ProductionJob.organization_id == org.id)
        .filter(~models.ProductionJob.status.in_(["TAMAMLANDI", "COMPLETED"]))
        .all()
    )

    jobs: List[ActiveJob] = []
    for job, order, partner, product, item in rows:
        jobs.append(
            ActiveJob(
                id=job.id,
                status=job.status,
                order_number=getattr(order, "order_number", None),
                partner_name=getattr(partner, "name", None),
                product_name=getattr(product, "name", None),
                width=getattr(item, "width", None),
                height=getattr(item, "height", None),
                quantity=getattr(item, "quantity", None),
            )
        )
    return jobs


@router.post("/jobs/{job_id}/status", response_model=ActiveJob)
def update_job_status(
    job_id: UUID,
    status_in: StatusUpdate,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
):
    job = (
        db.query(models.ProductionJob)
        .filter(
            models.ProductionJob.id == job_id,
            models.ProductionJob.organization_id == org.id,
        )
        .first()
    )
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.status = status_in.status
    db.commit()
    db.refresh(job)

    item = db.query(models.OrderItem).filter(models.OrderItem.id == job.order_item_id).first()
    order = (
        db.query(models.Order).filter(models.Order.id == item.order_id).first()
        if item
        else None
    )
    partner = (
        db.query(models.Partner).filter(models.Partner.id == order.partner_id).first()
        if order
        else None
    )
    product = (
        db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if item
        else None
    )

    return ActiveJob(
        id=job.id,
        status=job.status,
        order_number=getattr(order, "order_number", None),
        partner_name=getattr(partner, "name", None),
        product_name=getattr(product, "name", None),
        width=getattr(item, "width", None),
        height=getattr(item, "height", None),
        quantity=getattr(item, "quantity", None),
    )
