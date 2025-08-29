from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import calendar
from datetime import datetime

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_org
from ..auth import get_current_user
from ..core.deps import has_permission

router = APIRouter(prefix="/personnel", tags=["personnel"])


@router.get('/employees', response_model=List[schemas.EmployeeRead])
def list_employees(only_active: bool = True, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), _=Depends(has_permission('personnel:view'))):
    q = db.query(models.Employee).filter(models.Employee.organization_id == org.id)
    if only_active:
        q = q.filter(models.Employee.is_active == True)
    return q.order_by(models.Employee.last_name, models.Employee.first_name).all()


@router.post('/employees', response_model=schemas.EmployeeRead)
def create_employee(emp: schemas.EmployeeCreate, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), _=Depends(has_permission('personnel:create'))):
    obj = models.Employee(organization_id=org.id, **emp.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put('/employees/{emp_id}', response_model=schemas.EmployeeRead)
def update_employee(emp_id: str, emp: schemas.EmployeeCreate, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), _=Depends(has_permission('personnel:update'))):
    obj = db.query(models.Employee).filter(models.Employee.id == emp_id, models.Employee.organization_id == org.id).first()
    if not obj:
        raise HTTPException(status_code=404, detail='Employee not found')
    for k, v in emp.dict().items():
        setattr(obj, k, v)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete('/employees/{emp_id}')
def soft_delete_employee(emp_id: str, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), _=Depends(has_permission('personnel:delete'))):
    obj = db.query(models.Employee).filter(models.Employee.id == emp_id, models.Employee.organization_id == org.id).first()
    if not obj:
        raise HTTPException(status_code=404, detail='Employee not found')
    obj.is_active = False
    obj.deleted_at = func.now()
    db.add(obj)
    db.commit()
    return { 'ok': True }


@router.post('/leaves', response_model=schemas.LeaveRead)
def create_leave(leave: schemas.LeaveCreate, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), _=Depends(has_permission('personnel:update'))):
    obj = models.EmployeeLeave(organization_id=org.id, **leave.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get('/summary')
def summary(year: Optional[int] = None, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), _=Depends(has_permission('personnel:view'))):
    if not year:
        year = date.today().year
    # toplam personel, toplam maaş/sigorta, kişi bazlı izin günleri (yıl)
    total_emp = db.query(func.count(models.Employee.id)).filter(models.Employee.organization_id == org.id, models.Employee.is_active == True).scalar() or 0
    sums = db.query(func.coalesce(func.sum(models.Employee.salary), 0), func.coalesce(func.sum(models.Employee.insurance), 0)).filter(models.Employee.organization_id == org.id, models.Employee.is_active == True).first()
    total_salary = float(sums[0] or 0)
    total_insurance = float(sums[1] or 0)
    # izinler
    rows = (
        db.query(models.EmployeeLeave.employee_id, func.coalesce(func.sum(models.EmployeeLeave.days), 0))
        .filter(models.EmployeeLeave.organization_id == org.id)
        .filter(func.extract('year', models.EmployeeLeave.start_date) == year)
        .group_by(models.EmployeeLeave.employee_id)
        .all()
    )
    leaves = { str(emp_id): int(days or 0) for emp_id, days in rows }
    return { 'year': year, 'total_employees': int(total_emp), 'total_salary': total_salary, 'total_insurance': total_insurance, 'leaves': leaves }


@router.get('/employees/{emp_id}', response_model=schemas.EmployeeRead)
def get_employee(emp_id: str, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), _=Depends(has_permission('personnel:view'))):
    obj = db.query(models.Employee).filter(models.Employee.id == emp_id, models.Employee.organization_id == org.id).first()
    if not obj:
        raise HTTPException(status_code=404, detail='Employee not found')
    return obj


@router.get('/leaves', response_model=List[schemas.LeaveRead])
def list_leaves(employee_id: Optional[str] = None, year: Optional[int] = None, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), _=Depends(has_permission('personnel:view'))):
    q = db.query(models.EmployeeLeave).filter(models.EmployeeLeave.organization_id == org.id)
    if employee_id:
        q = q.filter(models.EmployeeLeave.employee_id == employee_id)
    if year:
        q = q.filter(func.extract('year', models.EmployeeLeave.start_date) == year)
    return q.order_by(models.EmployeeLeave.start_date.desc()).all()


@router.post('/employees/{emp_id}/restore')
def restore_employee(emp_id: str, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), _=Depends(has_permission('personnel:update'))):
    obj = db.query(models.Employee).filter(models.Employee.id == emp_id, models.Employee.organization_id == org.id).first()
    if not obj:
        raise HTTPException(status_code=404, detail='Employee not found')
    obj.is_active = True
    obj.deleted_at = None
    db.add(obj)
    db.commit()
    return { 'ok': True }


@router.get('/monthly')
def monthly_summary(year: Optional[int] = None, db: Session = Depends(get_db), org: models.Organization = Depends(get_current_org), _=Depends(has_permission('personnel:view'))):
    if not year:
        year = date.today().year
    # For each month, sum salary/insurance for employees employed during that month
    data = []
    for m in range(1, 13):
        first_day = date(year, m, 1)
        last_day = date(year, m, calendar.monthrange(year, m)[1])
        # employed in month if hire_date <= last_day and (deleted_at is NULL or deleted_at >= first_day)
        sums = (
            db.query(
                func.coalesce(func.sum(models.Employee.salary), 0),
                func.coalesce(func.sum(models.Employee.insurance), 0),
            )
            .filter(models.Employee.organization_id == org.id)
            .filter((models.Employee.hire_date == None) | (models.Employee.hire_date <= last_day))
            .filter((models.Employee.deleted_at == None) | (models.Employee.deleted_at >= datetime.combine(first_day, datetime.min.time())))
            .all()
        )[0]
        data.append({
            'month': m,
            'salary_total': float(sums[0] or 0),
            'insurance_total': float(sums[1] or 0),
        })
    return { 'year': year, 'months': data }
