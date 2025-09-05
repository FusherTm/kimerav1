from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from .. import models


def create_connection(
    db: Session,
    *,
    organization_id: UUID,
    partner_id: UUID,
    total_amount: Decimal,
    dt: Optional[date] = None,
    method: Optional[str] = None,
    description: Optional[str] = None,
) -> models.Connection:
    # Parse amount
    try:
        amt = Decimal(str(total_amount))
    except Exception:
        amt = Decimal("0")

    # Parse date (accept None / ISO / dd.mm.yyyy)
    parsed_date = None
    if isinstance(dt, str):
        s = dt.strip()
        if s:
            try:
                parsed_date = date.fromisoformat(s)
            except Exception:
                try:
                    # try dd.mm.yyyy
                    parts = s.replace('/', '.').split('.')
                    if len(parts) == 3:
                        d, m, y = [int(p) for p in parts]
                        parsed_date = date(y, m, d)
                except Exception:
                    parsed_date = None
    elif isinstance(dt, date):
        parsed_date = dt

    conn = models.Connection(
        organization_id=organization_id,
        partner_id=partner_id,
        total_amount=amt,
        remaining_amount=amt,
        date=parsed_date,
        method=method,
        description=description,
        status="OPEN",
    )
    db.add(conn)
    db.commit()
    db.refresh(conn)
    return conn


def list_connections(
    db: Session,
    *,
    organization_id: UUID,
    partner_id: Optional[UUID] = None,
    status: Optional[str] = None,
) -> List[models.Connection]:
    q = db.query(models.Connection).filter(models.Connection.organization_id == organization_id)
    if partner_id:
        q = q.filter(models.Connection.partner_id == partner_id)
    if status:
        q = q.filter(models.Connection.status == status)
    return q.order_by(models.Connection.date.desc().nullslast(), models.Connection.created_at.desc()).all()


def get_order_application(db: Session, *, organization_id: UUID, order_id: UUID) -> Optional[models.ConnectionApplication]:
    return (
        db.query(models.ConnectionApplication)
        .filter(
            models.ConnectionApplication.organization_id == organization_id,
            models.ConnectionApplication.order_id == order_id,
        )
        .first()
    )


def apply_connection(
    db: Session,
    *,
    organization_id: UUID,
    connection_id: UUID,
    order_id: UUID,
    amount: Decimal,
) -> models.ConnectionApplication:
    # Validate connection
    conn = (
        db.query(models.Connection)
        .filter(models.Connection.id == connection_id, models.Connection.organization_id == organization_id)
        .first()
    )
    if not conn:
        raise ValueError("Connection not found")

    # Validate order and status
    order = (
        db.query(models.Order)
        .filter(models.Order.id == order_id, models.Order.organization_id == organization_id)
        .first()
    )
    if not order:
        raise ValueError("Order not found")
    if (order.status or "").upper() != "SIPARIS":
        raise ValueError("Order must be in SIPARIS status to apply connection")

    # Only one connection per order
    existing_for_order = get_order_application(db, organization_id=organization_id, order_id=order_id)
    if existing_for_order and existing_for_order.connection_id != connection_id:
        raise ValueError("Order already has a different connection applied")

    # Amount validations
    amt = Decimal(amount or 0)
    if amt <= 0:
        raise ValueError("Amount must be positive")

    # Determine current remaining for this connection
    remaining = Decimal(conn.remaining_amount or 0)
    # If there is an existing application for this connection+order, we are updating it
    prev_amt = Decimal(existing_for_order.amount) if existing_for_order else Decimal("0")
    # Effective additional usage from connection is (amt - prev_amt)
    delta = amt - prev_amt
    if delta > remaining:
        raise ValueError("Amount exceeds remaining connection balance")

    # Persist changes
    if existing_for_order:
        existing_for_order.amount = amt
        app = existing_for_order
    else:
        app = models.ConnectionApplication(
            organization_id=organization_id,
            connection_id=connection_id,
            order_id=order_id,
            amount=amt,
            applied_at=date.today(),
        )
        db.add(app)

    # Update connection remaining and status
    conn.remaining_amount = (remaining - delta)
    if (conn.remaining_amount or 0) <= 0:
        conn.status = "CLOSED"
    db.add(conn)

    # Mirror to FinancialTransaction as OUT to reduce receivable
    tx = (
        db.query(models.FinancialTransaction)
        .filter(
            models.FinancialTransaction.organization_id == organization_id,
            models.FinancialTransaction.order_id == order_id,
            models.FinancialTransaction.method == "CONNECTION_APPLY",
        )
        .first()
    )
    if tx is None:
        tx = models.FinancialTransaction(
            organization_id=organization_id,
            account_id=None,
            partner_id=order.partner_id,
            order_id=order.id,
            purchase_order_id=None,
            direction=models.TransactionDirection.OUT,
            amount=amt,
            transaction_date=date.today(),
            description=f"Connection apply to order {order.order_number}",
            method="CONNECTION_APPLY",
        )
    else:
        tx.amount = amt
    db.add(tx)

    db.commit()
    db.refresh(app)
    return app
