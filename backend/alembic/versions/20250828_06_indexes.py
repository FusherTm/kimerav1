"""common indexes

Revision ID: indexes_20250828
Revises: personnel_20250828
Create Date: 2025-08-28
"""

from alembic import op
import sqlalchemy as sa


revision = 'indexes_20250828'
down_revision = 'personnel_20250828'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index('ix_partners_name', 'partners', ['name'])
    op.create_index('ix_products_sku', 'products', ['sku'])
    op.create_index('ix_categories_code', 'categories', ['code'])
    op.create_index('ix_orders_order_number', 'orders', ['order_number'])
    op.create_index('ix_orders_project_name', 'orders', ['project_name'])


def downgrade() -> None:
    op.drop_index('ix_orders_project_name', table_name='orders')
    op.drop_index('ix_orders_order_number', table_name='orders')
    op.drop_index('ix_categories_code', table_name='categories')
    op.drop_index('ix_products_sku', table_name='products')
    op.drop_index('ix_partners_name', table_name='partners')

