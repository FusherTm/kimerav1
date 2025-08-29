from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_org

router = APIRouter(prefix="/invoices", tags=["invoices"])


@router.post('/', response_model=schemas.InvoiceRead)
def create_invoice(inv: schemas.InvoiceCreate, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org)):
    obj = models.Invoice(
        organization_id=org.id,
        partner_id=inv.partner_id,
        invoice_number=inv.invoice_number,
        issue_date=inv.issue_date,
        due_date=inv.due_date,
        amount=inv.amount,
        status=inv.status,
        notes=inv.notes,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get('/', response_model=List[schemas.InvoiceRead])
def list_invoices(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
):
    q = db.query(models.Invoice).filter(models.Invoice.organization_id == org.id)
    if start_date:
        q = q.filter(models.Invoice.issue_date >= start_date)
    if end_date:
        q = q.filter(models.Invoice.issue_date <= end_date)
    return q.order_by(models.Invoice.issue_date.desc()).all()


@router.get('/summary')
def summary(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    org: models.Organization = Depends(get_current_org),
):
    q = db.query(
        func.date_trunc('month', models.Invoice.issue_date).label('month'),
        func.sum(models.Invoice.amount).label('total')
    ).filter(models.Invoice.organization_id == org.id)
    if start_date:
        q = q.filter(models.Invoice.issue_date >= start_date)
    if end_date:
        q = q.filter(models.Invoice.issue_date <= end_date)
    rows = q.group_by(func.date_trunc('month', models.Invoice.issue_date)).order_by(func.date_trunc('month', models.Invoice.issue_date)).all()
    total = sum([float(r.total or 0) for r in rows])
    data = [{ 'month': r.month.date().isoformat() if hasattr(r.month, 'date') else str(r.month), 'total': float(r.total or 0)} for r in rows]
    return { 'total': total, 'by_month': data }

