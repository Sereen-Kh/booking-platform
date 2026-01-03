"""add profile fields to users

Revision ID: add_profile_fields
Revises: 
Create Date: 2026-01-03 19:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_profile_fields'
down_revision: Union[str, None] = None
head_label: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add profile-related columns to users table
    op.add_column('users', sa.Column('phone', sa.String(), nullable=True))
    op.add_column('users', sa.Column('avatar_url', sa.String(), nullable=True))
    op.add_column('users', sa.Column('address', sa.String(), nullable=True))
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('is_profile_complete',
                  sa.Boolean(), server_default='false', nullable=False))


def downgrade() -> None:
    # Remove profile-related columns from users table
    op.drop_column('users', 'is_profile_complete')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'address')
    op.drop_column('users', 'avatar_url')
    op.drop_column('users', 'phone')
