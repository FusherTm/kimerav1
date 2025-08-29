"""add discount_percent and vat_inclusive to orders

Revision ID: order_pricing_20250829
Revises: checks_bank_used_20250829
Create Date: 2025-08-29
"""

from alembic import op
import sqlalchemy as sa


revision = 'order_pricing_20250829'
down_revision = 'checks_bank_used_20250829'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('orders', sa.Column('discount_percent', sa.Numeric(), nullable=True))
    op.add_column('orders', sa.Column('vat_inclusive', sa.Boolean(), nullable=True))


def downgrade() -> None:
    op.drop_column('orders', 'vat_inclusive')
    op.drop_column('orders', 'discount_percent')

