"""personnel tables

Revision ID: personnel_20250828
Revises: invoices_20250828
Create Date: 2025-08-28
"""

from alembic import op
import sqlalchemy as sa


revision = 'personnel_20250828'
down_revision = 'invoices_20250828'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'employees',
        sa.Column('id', sa.UUID(), primary_key=True, nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('first_name', sa.String(), nullable=False),
        sa.Column('last_name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('position', sa.String(), nullable=True),
        sa.Column('hire_date', sa.Date(), nullable=True),
        sa.Column('salary', sa.Numeric(), nullable=True),
        sa.Column('insurance', sa.Numeric(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'])
    )

    op.create_table(
        'employee_leaves',
        sa.Column('id', sa.UUID(), primary_key=True, nullable=False),
        sa.Column('organization_id', sa.UUID(), nullable=False),
        sa.Column('employee_id', sa.UUID(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('days', sa.Integer(), nullable=False),
        sa.Column('leave_type', sa.String(), nullable=True),
        sa.Column('note', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id']),
        sa.ForeignKeyConstraint(['employee_id'], ['employees.id'])
    )


def downgrade() -> None:
    op.drop_table('employee_leaves')
    op.drop_table('employees')

