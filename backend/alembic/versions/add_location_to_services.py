"""add_location_to_services

Revision ID: abc123456789
Revises: f18cb8181ad6
Create Date: 2026-01-02

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'abc123456789'
down_revision = 'f18cb8181ad6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add location column to services table
    op.add_column('services', sa.Column('location', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove location column from services table
    op.drop_column('services', 'location')
