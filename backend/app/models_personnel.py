import uuid
from datetime import datetime
from sqlalchemy import Column, String, Date, DateTime, Numeric, Boolean, Integer, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from .database import Base


class Employee(Base):
    __tablename__ = "employees"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    position = Column(String)
    hire_date = Column(Date)
    salary = Column(Numeric)
    insurance = Column(Numeric)
    is_active = Column(Boolean, default=True)
    deleted_at = Column(DateTime)
    notes = Column(Text)


class EmployeeLeave(Base):
    __tablename__ = "employee_leaves"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    days = Column(Integer, nullable=False)
    leave_type = Column(String)  # ANNUAL, SICK, UNPAID
    note = Column(Text)

