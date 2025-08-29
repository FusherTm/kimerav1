from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_
from datetime import date, timedelta

from .. import models


def get_dashboard_summary(db: Session, current_user: models.User):
    org_id = getattr(current_user, 'organization_id', None)
    if not org_id:
        return {
            'total_balance': 0,
            'total_receivables': 0,
            'total_payables': 0,
            'recent_transactions': [],
            'active_jobs': 0,
            'jobs_by_status': {},
            'todays_deliveries': [],
        }

    # Financial summary
    total_balance = (
        db.query(func.coalesce(func.sum(models.Account.current_balance), 0))
        .filter(models.Account.organization_id == org_id)
        .scalar()
    ) or 0

    # Compute receivables/payables from FinancialTransaction ledger per partner
    txs = (
        db.query(models.FinancialTransaction)
        .filter(models.FinancialTransaction.organization_id == org_id)
        .all()
    )
    partner_balances = {}
    for t in txs:
        if not t.partner_id:
            continue
        bal = partner_balances.get(t.partner_id, 0.0)
        amt = float(t.amount or 0)
        method = (t.method or "").upper()
        if method in ("ORDER", "PURCHASE"):
            bal += amt  # sales posted increases receivable
        else:
            # payments: IN (received) reduce receivable; OUT (paid) also reduce receivable
            if t.direction == models.TransactionDirection.IN:
                bal -= amt
            else:
                bal -= amt
        partner_balances[t.partner_id] = bal

    # Split totals by partner type: customers' positive -> receivables, negative -> payables;
    # suppliers' positive -> payables, negative -> receivables.
    total_receivables = 0.0
    total_payables = 0.0
    if partner_balances:
        partners = db.query(models.Partner.id, models.Partner.type).filter(models.Partner.id.in_(partner_balances.keys())).all()
        type_map = {pid: ptype for pid, ptype in partners}
        for pid, bal in partner_balances.items():
            ptype = type_map.get(pid)
            if ptype == models.PartnerType.SUPPLIER:
                if bal > 0:
                    total_payables += bal
                elif bal < 0:
                    total_receivables += -bal
            else:  # CUSTOMER or BOTH
                if bal > 0:
                    total_receivables += bal
                elif bal < 0:
                    total_payables += -bal

    # Recent transactions (last 5 by date, then id desc)
    recent = (
        db.query(models.FinancialTransaction)
        .filter(models.FinancialTransaction.organization_id == org_id)
        .order_by(models.FinancialTransaction.transaction_date.desc().nullslast(), desc(models.FinancialTransaction.id))
        .limit(5)
        .all()
    )
    recent_transactions = [
        {
            'id': str(t.id),
            'transaction_date': t.transaction_date.isoformat() if t.transaction_date else None,
            'direction': t.direction.value if hasattr(t.direction, 'value') else t.direction,
            'amount': float(t.amount or 0),
            'description': t.description,
            'method': t.method,
            'partner_id': str(t.partner_id) if t.partner_id else None,
        }
        for t in recent
    ]

    # Operational summary
    active_jobs = (
        db.query(func.count(models.ProductionJob.id))
        .filter(models.ProductionJob.organization_id == org_id)
        .filter(~models.ProductionJob.status.in_(["TAMAMLANDI", "COMPLETED"]))
        .scalar()
    ) or 0

    rows = (
        db.query(models.ProductionJob.status, func.count(models.ProductionJob.id))
        .filter(models.ProductionJob.organization_id == org_id)
        .filter(~models.ProductionJob.status.in_(["TAMAMLANDI", "COMPLETED"]))
        .group_by(models.ProductionJob.status)
        .all()
    )
    jobs_by_status = {status or 'UNKNOWN': int(cnt or 0) for status, cnt in rows}

    # Jobs by latest station (approximate current station by last completed log)
    sub_last = (
        db.query(
            models.ProductionLog.job_id.label('job_id'),
            func.max(models.ProductionLog.completed_at).label('max_dt'),
        )
        .group_by(models.ProductionLog.job_id)
        .subquery()
    )
    latest_logs = (
        db.query(models.ProductionLog.station_id, func.count(models.ProductionLog.id))
        .join(sub_last, and_(
            models.ProductionLog.job_id == sub_last.c.job_id,
            models.ProductionLog.completed_at == sub_last.c.max_dt,
        ))
        .join(models.ProductionJob, models.ProductionJob.id == models.ProductionLog.job_id)
        .filter(models.ProductionJob.organization_id == org_id)
        .filter(~models.ProductionJob.status.in_(["TAMAMLANDI", "COMPLETED"]))
        .group_by(models.ProductionLog.station_id)
        .all()
    )
    station_ids_counts = {sid: int(cnt or 0) for sid, cnt in latest_logs}
    # Map station ids to names
    if station_ids_counts:
        stations = db.query(models.ProductionStation).filter(models.ProductionStation.id.in_(station_ids_counts.keys())).all()
    else:
        stations = []
    id_to_name = {s.id: s.name for s in stations}
    jobs_by_station = {id_to_name.get(sid, 'UNASSIGNED'): cnt for sid, cnt in station_ids_counts.items()}
    # Count active jobs with no logs (unassigned)
    active_total = int(active_jobs or 0)
    assigned_sum = sum(jobs_by_station.values()) if jobs_by_station else 0
    if active_total > assigned_sum:
        jobs_by_station['UNASSIGNED'] = jobs_by_station.get('UNASSIGNED', 0) + (active_total - assigned_sum)

    # Today's deliveries
    today = date.today()
    deliveries = (
        db.query(models.Order, models.Partner)
        .outerjoin(models.Partner, models.Order.partner_id == models.Partner.id)
        .filter(models.Order.organization_id == org_id)
        .filter(models.Order.delivery_date == today)
        .all()
    )
    todays_deliveries = [
        {
            'id': str(o.id),
            'order_number': o.order_number,
            'partner_name': getattr(p, 'name', None),
        }
        for o, p in deliveries
    ]

    # Cash flow last 7 days (payments only, exclude ORDER postings)
    start_day = date.today() - timedelta(days=6)
    recent_payments = (
        db.query(models.FinancialTransaction)
        .filter(models.FinancialTransaction.organization_id == org_id)
        .filter(models.FinancialTransaction.transaction_date != None)
        .filter(models.FinancialTransaction.transaction_date >= start_day)
        .filter(func.coalesce(models.FinancialTransaction.method, '') != 'ORDER')
        .all()
    )
    flow_map = { (start_day + timedelta(days=i)): 0.0 for i in range(7) }
    for t in recent_payments:
        d = t.transaction_date
        if d in flow_map:
            amt = float(t.amount or 0)
            if t.direction == models.TransactionDirection.IN:
                flow_map[d] += amt
            else:
                flow_map[d] -= amt
    cash_flow_7d = [ flow_map[day] for day in sorted(flow_map.keys()) ]

    return {
        'total_balance': float(total_balance),
        'total_receivables': float(total_receivables),
        'total_payables': float(total_payables),
        'recent_transactions': recent_transactions,
        'active_jobs': int(active_jobs),
        'jobs_by_status': jobs_by_status,
        'jobs_by_station': jobs_by_station,
        'todays_deliveries': todays_deliveries,
        'cash_flow_7d': cash_flow_7d,
    }
