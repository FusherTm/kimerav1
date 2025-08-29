"""link sales orders to purchase orders

Revision ID: link_so_po_20250828
Revises: 29331ba7db79
Create Date: 2025-08-28
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'link_so_po_20250828'
down_revision = '29331ba7db79'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('purchase_orders', sa.Column('sales_order_id', sa.UUID(), nullable=True))
    op.create_foreign_key('fk_purchase_orders_sales_order', 'purchase_orders', 'orders', ['sales_order_id'], ['id'])

    op.add_column('purchase_order_items', sa.Column('sales_order_item_id', sa.UUID(), nullable=True))
    op.create_foreign_key('fk_poi_sales_order_item', 'purchase_order_items', 'order_items', ['sales_order_item_id'], ['id'])


def downgrade() -> None:
    op.drop_constraint('fk_poi_sales_order_item', 'purchase_order_items', type_='foreignkey')
    op.drop_column('purchase_order_items', 'sales_order_item_id')

    op.drop_constraint('fk_purchase_orders_sales_order', 'purchase_orders', type_='foreignkey')
    op.drop_column('purchase_orders', 'sales_order_id')

