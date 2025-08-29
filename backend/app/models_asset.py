import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Numeric, ForeignKey, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base


class Asset(Base):
    __tablename__ = "assets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String, nullable=False)
    asset_type = Column(String, nullable=False)  # VEHICLE, REAL_ESTATE, CHECK
    acquisition_date = Column(DateTime, default=datetime.utcnow)
    current_value = Column(Numeric)
    status = Column(String)

    vehicle_detail = relationship("AssetDetailVehicle", back_populates="asset", uselist=False)
    realestate_detail = relationship("AssetDetailRealEstate", back_populates="asset", uselist=False)
    check_detail = relationship("AssetDetailCheck", back_populates="asset", uselist=False)


class AssetDetailVehicle(Base):
    __tablename__ = "asset_detail_vehicle"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    license_plate = Column(String)
    make = Column(String)
    model = Column(String)
    year = Column(String)

    asset = relationship("Asset", back_populates="vehicle_detail")


class AssetDetailRealEstate(Base):
    __tablename__ = "asset_detail_real_estate"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    property_type = Column(String)
    address = Column(String)
    parcel_info = Column(String)

    asset = relationship("Asset", back_populates="realestate_detail")


class AssetDetailCheck(Base):
    __tablename__ = "asset_detail_check"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    asset_id = Column(UUID(as_uuid=True), ForeignKey("assets.id"), nullable=False)
    partner_id = Column(UUID(as_uuid=True), ForeignKey("partners.id"), nullable=True)
    check_number = Column(String)
    due_date = Column(Date)
    amount = Column(Numeric)
    status = Column(String)  # PORTFOLIO, CASHED
    bank_name = Column(String)
    bank_branch = Column(String)
    given_to_partner_id = Column(UUID(as_uuid=True), ForeignKey("partners.id"), nullable=True)
    given_to_name = Column(String)

    asset = relationship("Asset", back_populates="check_detail")
