import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Boolean,
    ForeignKey,
    Date,
    DateTime,
    Integer,
    Numeric,
    Enum,
    DECIMAL,
    JSON,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base
from enum import Enum as PyEnum
from .models_asset import Asset, AssetDetailVehicle, AssetDetailRealEstate, AssetDetailCheck
from .models_personnel import Employee, EmployeeLeave
from sqlalchemy import UniqueConstraint
from sqlalchemy.sql import func


class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("partners.id"), nullable=True)
    invoice_number = Column(String, nullable=False)
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date)
    amount = Column(Numeric, nullable=False)
    status = Column(String)
    notes = Column(String)

class PartnerType(str, PyEnum):
    CUSTOMER = "CUSTOMER"
    SUPPLIER = "SUPPLIER"
    BOTH = "BOTH"

class AccountType(str, PyEnum):
    CASH = "CASH"
    BANK = "BANK"

class TransactionDirection(str, PyEnum):
    IN = "IN"
    OUT = "OUT"

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)

    users = relationship("UserOrganization", back_populates="organization")

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    organizations = relationship("UserOrganization", back_populates="user")

class UserOrganization(Base):
    __tablename__ = "user_organizations"
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), primary_key=True)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), primary_key=True)
    role = Column(String, nullable=False)

    user = relationship("User", back_populates="organizations")
    organization = relationship("Organization", back_populates="users")


class Role(Base):
    __tablename__ = "roles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)
    permissions = Column(JSON, default={})

class Partner(Base):
    __tablename__ = "partners"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    type = Column(Enum(PartnerType), nullable=False)
    name = Column(String, nullable=False)
    contact_person = Column(String)
    phone = Column(String)
    email = Column(String)
    address = Column(String)
    tax_number = Column(String)
    is_active = Column(Boolean, default=True)

class Category(Base):
    __tablename__ = "categories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)

class Product(Base):
    __tablename__ = "products"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)
    sku = Column(String, nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"))
    base_price_sqm = Column(Numeric)

class Material(Base):
    __tablename__ = "materials"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)
    sku = Column(String, nullable=False)
    stock_quantity = Column(DECIMAL)
    unit = Column(String, nullable=False)

class Order(Base):
    __tablename__ = "orders"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("partners.id"))
    project_name = Column(String)
    order_number = Column(String)
    status = Column(String)
    order_date = Column(Date)
    delivery_date = Column(Date)
    delivery_method = Column(String)
    notes = Column(String)
    grand_total = Column(Numeric)
    # New: pricing controls
    discount_percent = Column(Numeric)  # general discount on subtotal (%), nullable
    vat_inclusive = Column(Boolean, default=False)  # if True, unit prices include VAT

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    description = Column(String)
    # Optional: directly provide total area (m^2) instead of width/height
    area_sqm = Column(DECIMAL)
    width = Column(Integer)
    height = Column(Integer)
    quantity = Column(Integer)
    unit_price = Column(Numeric)
    total_price = Column(Numeric)
    notes = Column(String)

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("partners.id"))
    po_number = Column(String)
    status = Column(String)
    order_date = Column(Date)
    expected_delivery_date = Column(Date)
    grand_total = Column(Numeric)
    sales_order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"))

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    purchase_order_id = Column(UUID(as_uuid=True), ForeignKey("purchase_orders.id"), nullable=False)
    description = Column(String)
    quantity = Column(Integer)
    unit_price = Column(Numeric)
    total_price = Column(Numeric)
    sales_order_item_id = Column(UUID(as_uuid=True), ForeignKey("order_items.id"))

class ProductionStation(Base):
    __tablename__ = "production_stations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    order_index = Column(Integer)

class ProductionJob(Base):
    __tablename__ = "production_jobs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    order_item_id = Column(UUID(as_uuid=True), ForeignKey("order_items.id"), nullable=False)
    job_number = Column(String)
    status = Column(String)
    quantity_required = Column(Integer)
    quantity_produced = Column(Integer)

class ProductionLog(Base):
    __tablename__ = "production_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("production_jobs.id"), nullable=False)
    station_id = Column(UUID(as_uuid=True), ForeignKey("production_stations.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    completed_at = Column(DateTime, default=datetime.utcnow)
    quantity = Column(Integer)
    notes = Column(String)

class Account(Base):
    __tablename__ = "accounts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(Enum(AccountType), nullable=False)
    current_balance = Column(Numeric, default=0)

class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"))
    partner_id = Column(UUID(as_uuid=True), ForeignKey("partners.id"))
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"))
    purchase_order_id = Column(UUID(as_uuid=True), ForeignKey("purchase_orders.id"))
    direction = Column(Enum(TransactionDirection), nullable=False)
    amount = Column(Numeric, nullable=False)
    transaction_date = Column(Date)
    description = Column(String)
    method = Column(String)


class SupplierPrice(Base):
    __tablename__ = "supplier_prices"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    supplier_id = Column(UUID(as_uuid=True), ForeignKey("partners.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    unit_price = Column(Numeric, nullable=False)


class Connection(Base):
    __tablename__ = "connections"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("partners.id"), nullable=False)
    total_amount = Column(Numeric, nullable=False)
    remaining_amount = Column(Numeric, nullable=False)
    date = Column(Date)
    method = Column(String)
    description = Column(String)
    status = Column(String, default="OPEN")
    created_at = Column(DateTime, server_default=func.now())


class ConnectionApplication(Base):
    __tablename__ = "connection_applications"
    __table_args__ = (
        UniqueConstraint("order_id", name="uq_connection_application_order"),
    )
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    connection_id = Column(UUID(as_uuid=True), ForeignKey("connections.id"), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    amount = Column(Numeric, nullable=False)
    # Store only the date part; rely on DB current_date
    applied_at = Column(Date, server_default=func.current_date())
