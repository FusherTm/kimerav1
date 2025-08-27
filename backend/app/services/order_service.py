from datetime import date
from decimal import Decimal
from typing import List, Optional, Tuple
from uuid import UUID

from sqlalchemy.orm import Session

from .. import models, schemas


def _generate_order_number(db: Session, org_id: UUID, order_date: date) -> str:
    """Generate sequential order number like '2025-001' per organization per year."""
    year = order_date.year
    prefix = f"{year}-"
    last_order = (
        db.query(models.Order)
        .filter(
            models.Order.organization_id == org_id,
            models.Order.order_number.like(f"{prefix}%"),
        )
        .order_by(models.Order.order_number.desc())
        .first()
    )
    seq = 1
    if last_order and last_order.order_number:
        try:
            seq = int(last_order.order_number.split("-")[1]) + 1
        except Exception:
            seq = 1
    return f"{year}-{seq:03d}"


def create_order(
    db: Session, order_in: schemas.OrderCreateWithItems, current_user: models.User
) -> models.Order:
    """Create an order with items for the current organization."""
    ord_date = order_in.order_date or date.today()
    order_number = _generate_order_number(db, current_user.organization_id, ord_date)

    order = models.Order(
        organization_id=current_user.organization_id,
        partner_id=order_in.partner_id,
        project_name=order_in.project_name,
        order_number=order_number,
        status=order_in.status or "DRAFT",
        order_date=ord_date,
        delivery_date=order_in.delivery_date,
        delivery_method=order_in.delivery_method,
        notes=order_in.notes,
        grand_total=Decimal("0"),
    )
    db.add(order)
    db.flush()  # obtain order.id

    grand_total = Decimal("0")
    for item_in in order_in.items:
        width_m = Decimal(item_in.width or 0) / Decimal(1000)
        height_m = Decimal(item_in.height or 0) / Decimal(1000)
        quantity = item_in.quantity or 0
        unit_price = Decimal(item_in.unit_price or 0)
        total_price = width_m * height_m * quantity * unit_price
        grand_total += total_price

        order_item = models.OrderItem(
            organization_id=current_user.organization_id,
            order_id=order.id,
            product_id=item_in.product_id,
            description=item_in.description,
            width=item_in.width,
            height=item_in.height,
            quantity=quantity,
            unit_price=unit_price,
            total_price=total_price,
            notes=item_in.notes,
        )
        db.add(order_item)

    order.grand_total = grand_total
    db.commit()
    db.refresh(order)
    return order


def update_order_status(
    db: Session, order_id: UUID, status: str, current_user: models.User
) -> Optional[models.Order]:
    order = (
        db.query(models.Order)
        .filter(
            models.Order.id == order_id,
            models.Order.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not order:
        return None

    order.status = status
    db.add(order)

    if status == "URETIMDE":
        items = (
            db.query(models.OrderItem)
            .filter(
                models.OrderItem.order_id == order.id,
                models.OrderItem.organization_id == current_user.organization_id,
            )
            .all()
        )
        for idx, item in enumerate(items, start=1):
            job = models.ProductionJob(
                organization_id=current_user.organization_id,
                order_item_id=item.id,
                job_number=f"{order.order_number}-{idx:03d}",
                status="PENDING",
                quantity_required=item.quantity,
                quantity_produced=0,
            )
            db.add(job)

    db.commit()
    db.refresh(order)
    return order


def list_orders(
    db: Session, current_user: models.User, skip: int = 0, limit: int = 100
) -> List[models.Order]:
    return (
        db.query(models.Order)
        .filter(models.Order.organization_id == current_user.organization_id)
        .order_by(models.Order.order_date.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_order(
    db: Session, order_id: UUID, current_user: models.User
) -> Tuple[Optional[models.Order], List[models.OrderItem]]:
    order = (
        db.query(models.Order)
        .filter(
            models.Order.id == order_id,
            models.Order.organization_id == current_user.organization_id,
        )
        .first()
    )
    if not order:
        return None, []
    items = (
        db.query(models.OrderItem)
        .filter(
            models.OrderItem.order_id == order.id,
            models.OrderItem.organization_id == current_user.organization_id,
        )
        .all()
    )
    return order, items
