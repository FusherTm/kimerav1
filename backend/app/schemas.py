from __future__ import annotations
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict
from enum import Enum
from typing import Any, Dict

class PartnerType(str, Enum):
    CUSTOMER = "CUSTOMER"
    SUPPLIER = "SUPPLIER"
    BOTH = "BOTH"

class AccountType(str, Enum):
    CASH = "CASH"
    BANK = "BANK"

class TransactionDirection(str, Enum):
    IN = "IN"
    OUT = "OUT"

class OrganizationBase(BaseModel):
    name: str
    slug: str

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationRead(OrganizationBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: UUID
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class UserOrganizationBase(BaseModel):
    user_id: UUID
    org_id: UUID
    role: str

class PartnerBase(BaseModel):
    type: PartnerType
    name: str
    contact_person: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    tax_number: Optional[str]
    is_active: Optional[bool] = True

class PartnerCreate(PartnerBase):
    pass

class PartnerRead(PartnerBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class CategoryBase(BaseModel):
    name: str
    code: str

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    sku: str
    category_id: Optional[UUID]
    base_price_sqm: Optional[Decimal]

class ProductCreate(ProductBase):
    pass

class ProductRead(ProductBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class MaterialBase(BaseModel):
    name: str
    sku: str
    stock_quantity: Optional[Decimal]
    unit: str

class MaterialCreate(MaterialBase):
    pass

class MaterialRead(MaterialBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    stock_quantity: Optional[Decimal] = None
    unit: Optional[str] = None

class OrderBase(BaseModel):
    partner_id: Optional[UUID] = None
    project_name: Optional[str] = None
    order_number: Optional[str] = None
    status: Optional[str] = None
    order_date: Optional[date] = None
    delivery_date: Optional[date] = None
    delivery_method: Optional[str] = None
    notes: Optional[str] = None
    grand_total: Optional[Decimal] = None
    discount_percent: Optional[Decimal] = None
    vat_inclusive: Optional[bool] = None

class OrderCreate(OrderBase):
    pass

class OrderRead(OrderBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class OrderItemBase(BaseModel):
    order_id: UUID
    product_id: Optional[UUID]
    description: Optional[str]
    area_sqm: Optional[Decimal]
    width: Optional[int]
    height: Optional[int]
    quantity: Optional[int]
    unit_price: Optional[Decimal]
    total_price: Optional[Decimal]
    notes: Optional[str]

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemRead(OrderItemBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class OrderItemNested(BaseModel):
    product_id: Optional[UUID] = None
    description: Optional[str] = None
    area_sqm: Optional[Decimal] = None
    width: Optional[int] = None
    height: Optional[int] = None
    quantity: Optional[int] = None
    unit_price: Optional[Decimal] = None
    notes: Optional[str] = None


class OrderCreateWithItems(OrderBase):
    items: List[OrderItemNested] = []


class OrderDetail(OrderRead):
    items: List[OrderItemRead] = []

class PurchaseOrderBase(BaseModel):
    partner_id: Optional[UUID] = None
    po_number: Optional[str] = None
    status: Optional[str] = None
    order_date: Optional[date] = None
    expected_delivery_date: Optional[date] = None
    grand_total: Optional[Decimal] = None
    sales_order_id: Optional[UUID] = None

class PurchaseOrderCreate(PurchaseOrderBase):
    pass

class PurchaseOrderRead(PurchaseOrderBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class PurchaseOrderItemBase(BaseModel):
    purchase_order_id: UUID
    description: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[Decimal] = None
    total_price: Optional[Decimal] = None
    sales_order_item_id: Optional[UUID] = None

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItemRead(PurchaseOrderItemBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class ProductionStationBase(BaseModel):
    name: str
    code: str
    order_index: Optional[int]

class ProductionStationCreate(ProductionStationBase):
    pass

class ProductionStationRead(ProductionStationBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class ProductionJobBase(BaseModel):
    order_item_id: UUID
    job_number: Optional[str]
    status: Optional[str]
    quantity_required: Optional[int]
    quantity_produced: Optional[int]

class ProductionJobCreate(ProductionJobBase):
    pass

class ProductionJobRead(ProductionJobBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class ProductionLogBase(BaseModel):
    job_id: UUID
    station_id: UUID
    user_id: UUID
    completed_at: Optional[datetime]
    quantity: Optional[int]
    notes: Optional[str]

class ProductionLogCreate(ProductionLogBase):
    pass

class ProductionLogRead(ProductionLogBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class AccountBase(BaseModel):
    name: str
    type: AccountType
    current_balance: Optional[Decimal]

class AccountCreate(AccountBase):
    pass

class AccountRead(AccountBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class FinancialTransactionBase(BaseModel):
    account_id: Optional[UUID] = None
    partner_id: Optional[UUID] = None
    order_id: Optional[UUID] = None
    purchase_order_id: Optional[UUID] = None
    direction: TransactionDirection
    amount: Decimal
    transaction_date: Optional[date] = None
    description: Optional[str] = None
    method: Optional[str] = None

class FinancialTransactionCreate(FinancialTransactionBase):
    pass

class FinancialTransactionRead(FinancialTransactionBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class SupplierPriceBase(BaseModel):
    supplier_id: UUID
    product_id: UUID
    unit_price: Decimal


class SupplierPriceCreate(SupplierPriceBase):
    pass


class SupplierPriceRead(SupplierPriceBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


# Asset module schemas
class AssetBase(BaseModel):
    name: str
    asset_type: str
    acquisition_date: Optional[datetime] = None
    current_value: Optional[Decimal] = None
    status: Optional[str] = None


class AssetCreate(AssetBase):
    # details is dynamic based on asset_type
    details: Dict[str, Any] = {}


class AssetRead(AssetBase):
    id: UUID
    check_detail: Optional["AssetDetailCheck"] = None
    model_config = ConfigDict(from_attributes=True)


class AssetDetailVehicle(BaseModel):
    asset_id: UUID
    license_plate: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[str] = None


class AssetDetailRealEstate(BaseModel):
    asset_id: UUID
    property_type: Optional[str] = None
    address: Optional[str] = None
    parcel_info: Optional[str] = None


class AssetDetailCheck(BaseModel):
    asset_id: UUID
    partner_id: Optional[UUID] = None
    check_number: Optional[str] = None
    due_date: Optional[date] = None
    amount: Optional[Decimal] = None
    status: Optional[str] = None
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None
    given_to_partner_id: Optional[UUID] = None
    given_to_name: Optional[str] = None


class AssetCheckStatusUpdate(BaseModel):
    status: str
    given_to_partner_id: Optional[UUID] = None
    given_to_name: Optional[str] = None


# Invoices
class InvoiceBase(BaseModel):
    invoice_number: str
    partner_id: Optional[UUID] = None
    issue_date: date
    due_date: Optional[date] = None
    amount: Decimal
    status: Optional[str] = None
    notes: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    pass


class InvoiceRead(InvoiceBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


# Personnel
class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    hire_date: Optional[date] = None
    salary: Optional[Decimal] = None
    insurance: Optional[Decimal] = None
    notes: Optional[str] = None


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeRead(EmployeeBase):
    id: UUID
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


class LeaveBase(BaseModel):
    employee_id: UUID
    start_date: date
    end_date: date
    days: int
    leave_type: Optional[str] = None
    note: Optional[str] = None


class LeaveCreate(LeaveBase):
    pass


class LeaveRead(LeaveBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


