"""add bank fields and given_to for checks

Revision ID: checks_bank_used_20250829
Revises: order_items_area_sqm_20250829
Create Date: 2025-08-29
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = 'checks_bank_used_20250829'
down_revision = 'order_items_area_sqm_20250829'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('asset_detail_check', sa.Column('bank_name', sa.String(), nullable=True))
    op.add_column('asset_detail_check', sa.Column('bank_branch', sa.String(), nullable=True))
    op.add_column('asset_detail_check', sa.Column('given_to_partner_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column('asset_detail_check', sa.Column('given_to_name', sa.String(), nullable=True))
    op.create_foreign_key('fk_asset_check_given_to_partner', 'asset_detail_check', 'partners', ['given_to_partner_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_asset_check_given_to_partner', 'asset_detail_check', type_='foreignkey')
    op.drop_column('asset_detail_check', 'given_to_name')
    op.drop_column('asset_detail_check', 'given_to_partner_id')
    op.drop_column('asset_detail_check', 'bank_branch')
    op.drop_column('asset_detail_check', 'bank_name')

