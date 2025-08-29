"""create assets tables

Revision ID: assets_20250828
Revises: supplier_prices_20250828
Create Date: 2025-08-28
"""

from alembic import op
import sqlalchemy as sa


revision = 'assets_20250828'
down_revision = 'supplier_prices_20250828'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'assets',
        sa.Column('id', sa.UUID(), primary_key=True, nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('asset_type', sa.String(), nullable=False),
        sa.Column('acquisition_date', sa.DateTime(), nullable=True),
        sa.Column('current_value', sa.Numeric(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'])
    )

    op.create_table(
        'asset_detail_vehicle',
        sa.Column('id', sa.UUID(), primary_key=True, nullable=False),
        sa.Column('asset_id', sa.UUID(), nullable=False),
        sa.Column('license_plate', sa.String(), nullable=True),
        sa.Column('make', sa.String(), nullable=True),
        sa.Column('model', sa.String(), nullable=True),
        sa.Column('year', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.id'])
    )

    op.create_table(
        'asset_detail_real_estate',
        sa.Column('id', sa.UUID(), primary_key=True, nullable=False),
        sa.Column('asset_id', sa.UUID(), nullable=False),
        sa.Column('property_type', sa.String(), nullable=True),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('parcel_info', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.id'])
    )

    op.create_table(
        'asset_detail_check',
        sa.Column('id', sa.UUID(), primary_key=True, nullable=False),
        sa.Column('asset_id', sa.UUID(), nullable=False),
        sa.Column('partner_id', sa.UUID(), nullable=True),
        sa.Column('check_number', sa.String(), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('amount', sa.Numeric(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['asset_id'], ['assets.id']),
        sa.ForeignKeyConstraint(['partner_id'], ['partners.id'])
    )


def downgrade() -> None:
    op.drop_table('asset_detail_check')
    op.drop_table('asset_detail_real_estate')
    op.drop_table('asset_detail_vehicle')
    op.drop_table('assets')

