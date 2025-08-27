from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr
from enum import Enum

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

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserRead(UserBase):
    id: UUID
    is_active: bool

    class Config:
        orm_mode = True

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

class PartnerCreate(PartnerBase):
    pass

class PartnerRead(PartnerBase):
    id: UUID

    class Config:
        orm_mode = True

class CategoryBase(BaseModel):
    name: str
    code: str

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: UUID

    class Config:
        orm_mode = True

class ProductBase(BaseModel):
    name: str
    sku: str
    category_id: Optional[UUID]
    base_price_sqm: Optional[Decimal]

class ProductCreate(ProductBase):
    pass

class ProductRead(ProductBase):
    id: UUID

    class Config:
        orm_mode = True

class MaterialBase(BaseModel):
    name: str
    sku: str
    stock_quantity: Optional[Decimal]
    unit: str

class MaterialCreate(MaterialBase):
    pass

class MaterialRead(MaterialBase):
    id: UUID

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    partner_id: Optional[UUID]
    project_name: Optional[str]
    order_number: Optional[str]
    status: Optional[str]
    order_date: Optional[date]
    delivery_date: Optional[date]
    delivery_method: Optional[str]
    notes: Optional[str]
    grand_total: Optional[Decimal]

class OrderCreate(OrderBase):
    pass

class OrderRead(OrderBase):
    id: UUID

    class Config:
        orm_mode = True

class OrderItemBase(BaseModel):
    order_id: UUID
    product_id: Optional[UUID]
    description: Optional[str]
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

    class Config:
        orm_mode = True

class PurchaseOrderBase(BaseModel):
    partner_id: Optional[UUID]
    po_number: Optional[str]
    status: Optional[str]
    order_date: Optional[date]
    expected_delivery_date: Optional[date]
    grand_total: Optional[Decimal]

class PurchaseOrderCreate(PurchaseOrderBase):
    pass

class PurchaseOrderRead(PurchaseOrderBase):
    id: UUID

    class Config:
        orm_mode = True

class PurchaseOrderItemBase(BaseModel):
    purchase_order_id: UUID
    description: Optional[str]
    quantity: Optional[int]
    unit_price: Optional[Decimal]
    total_price: Optional[Decimal]

class PurchaseOrderItemCreate(PurchaseOrderItemBase):
    pass

class PurchaseOrderItemRead(PurchaseOrderItemBase):
    id: UUID

    class Config:
        orm_mode = True

class ProductionStationBase(BaseModel):
    name: str
    code: str
    order_index: Optional[int]

class ProductionStationCreate(ProductionStationBase):
    pass

class ProductionStationRead(ProductionStationBase):
    id: UUID

    class Config:
        orm_mode = True

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

    class Config:
        orm_mode = True

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

    class Config:
        orm_mode = True

class AccountBase(BaseModel):
    name: str
    type: AccountType
    current_balance: Optional[Decimal]

class AccountCreate(AccountBase):
    pass

class AccountRead(AccountBase):
    id: UUID

    class Config:
        orm_mode = True

class FinancialTransactionBase(BaseModel):
    account_id: Optional[UUID]
    partner_id: Optional[UUID]
    order_id: Optional[UUID]
    purchase_order_id: Optional[UUID]
    direction: TransactionDirection
    amount: Decimal
    transaction_date: Optional[date]
    description: Optional[str]
    method: Optional[str]

class FinancialTransactionCreate(FinancialTransactionBase):
    pass

class FinancialTransactionRead(FinancialTransactionBase):
    id: UUID

    class Config:
        orm_mode = True
