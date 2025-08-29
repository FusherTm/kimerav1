from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_org
from ..auth import get_current_user
from ..core.deps import has_permission

router = APIRouter(prefix="/financial_transactions", tags=["financial_transactions"])


@router.get('/', response_model=List[schemas.FinancialTransactionRead])
def list_tx(
    partner_id: Optional[UUID] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    user=Depends(has_permission("finance:view")),
):
    q = db.query(models.FinancialTransaction).filter(models.FinancialTransaction.organization_id == org.id)
    if partner_id:
        q = q.filter(models.FinancialTransaction.partner_id == partner_id)
    return (
        q.order_by(models.FinancialTransaction.transaction_date.desc().nullslast(), models.FinancialTransaction.id.desc())
        .limit(limit)
        .all()
    )


@router.post('/', response_model=schemas.FinancialTransactionRead)
def create_tx(
    body: schemas.FinancialTransactionCreate,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
    user=Depends(has_permission("finance:edit")),
):
    # Validate account belongs to org (or null)
    account = None
    if body.account_id:
        account = (
            db.query(models.Account)
            .filter(models.Account.id == body.account_id, models.Account.organization_id == org.id)
            .first()
        )
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")

    tx = models.FinancialTransaction(
        organization_id=org.id,
        account_id=body.account_id,
        partner_id=body.partner_id,
        order_id=None,
        purchase_order_id=None,
        direction=body.direction,
        amount=body.amount,
        transaction_date=body.transaction_date,
        description=body.description,
        method=body.method,
    )
    db.add(tx)

    # Update account balance: IN -> +, OUT -> -
    if account is not None:
        if body.direction == models.TransactionDirection.IN:
            account.current_balance = (account.current_balance or 0) + (body.amount or 0)
        else:
            account.current_balance = (account.current_balance or 0) - (body.amount or 0)
        db.add(account)

    db.commit()
    db.refresh(tx)
    return tx
