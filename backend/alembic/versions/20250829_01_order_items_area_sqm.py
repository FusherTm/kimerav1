"""add area_sqm to order_items

Revision ID: order_items_area_sqm_20250829
Revises: indexes_20250828
Create Date: 2025-08-29
"""

from alembic import op
import sqlalchemy as sa


revision = 'order_items_area_sqm_20250829'
down_revision = 'indexes_20250828'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('order_items', sa.Column('area_sqm', sa.DECIMAL(), nullable=True))


def downgrade() -> None:
    op.drop_column('order_items', 'area_sqm')

