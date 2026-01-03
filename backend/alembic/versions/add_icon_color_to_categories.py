"""add_icon_color_to_categories

Revision ID: def456789abc
Revises: abc123456789
Create Date: 2026-01-02

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'def456789abc'
down_revision = 'abc123456789'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add icon and color columns to categories table
    op.add_column('categories', sa.Column('icon', sa.String(), nullable=True))
    op.add_column('categories', sa.Column('color', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove icon and color columns from categories table
    op.drop_column('categories', 'color')
    op.drop_column('categories', 'icon')
