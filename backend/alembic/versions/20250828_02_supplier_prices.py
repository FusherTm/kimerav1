"""add supplier_prices table

Revision ID: supplier_prices_20250828
Revises: link_so_po_20250828
Create Date: 2025-08-28
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'supplier_prices_20250828'
down_revision = 'link_so_po_20250828'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'supplier_prices',
        sa.Column('id', sa.UUID(), primary_key=True, nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('supplier_id', sa.UUID(), nullable=False),
        sa.Column('product_id', sa.UUID(), nullable=False),
        sa.Column('unit_price', sa.Numeric(), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id']),
        sa.ForeignKeyConstraint(['supplier_id'], ['partners.id']),
        sa.ForeignKeyConstraint(['product_id'], ['products.id']),
    )
    op.create_index('ix_supplier_prices_org_supplier_product', 'supplier_prices', ['organization_id','supplier_id','product_id'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_supplier_prices_org_supplier_product', table_name='supplier_prices')
    op.drop_table('supplier_prices')

