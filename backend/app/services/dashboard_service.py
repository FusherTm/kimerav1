from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models


def get_dashboard_summary(db: Session, current_user: models.User):
    org_id = getattr(current_user, 'organization_id', None)
    if not org_id:
        return {
            'total_balance': 0,
            'active_jobs': 0,
            'waiting_orders': 0,
            'total_customers': 0,
        }

    total_balance = (
        db.query(func.coalesce(func.sum(models.Account.current_balance), 0))
        .filter(models.Account.organization_id == org_id)
        .scalar()
    )

    active_jobs = (
        db.query(func.count(models.ProductionJob.id))
        .filter(models.ProductionJob.organization_id == org_id)
        .filter(~models.ProductionJob.status.in_(["TAMAMLANDI", "COMPLETED"]))
        .scalar()
    )

    waiting_orders = (
        db.query(func.count(models.Order.id))
        .filter(models.Order.organization_id == org_id)
        .filter(models.Order.status == "SIPARIS")
        .scalar()
    )

    total_customers = (
        db.query(func.count(models.Partner.id))
        .filter(models.Partner.organization_id == org_id)
        .filter(models.Partner.type.in_([models.PartnerType.CUSTOMER, models.PartnerType.BOTH]))
        .scalar()
    )

    return {
        'total_balance': float(total_balance or 0),
        'active_jobs': int(active_jobs or 0),
        'waiting_orders': int(waiting_orders or 0),
        'total_customers': int(total_customers or 0),
    }
