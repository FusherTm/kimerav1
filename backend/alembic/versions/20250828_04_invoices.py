"""create invoices table

Revision ID: invoices_20250828
Revises: assets_20250828
Create Date: 2025-08-28
"""

from alembic import op
import sqlalchemy as sa


revision = 'invoices_20250828'
down_revision = 'assets_20250828'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'invoices',
        sa.Column('id', sa.UUID(), primary_key=True, nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('partner_id', sa.UUID(), nullable=True),
        sa.Column('invoice_number', sa.String(), nullable=False),
        sa.Column('issue_date', sa.Date(), nullable=False),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('amount', sa.Numeric(), nullable=False),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id']),
        sa.ForeignKeyConstraint(['partner_id'], ['partners.id'])
    )


def downgrade() -> None:
    op.drop_table('invoices')

