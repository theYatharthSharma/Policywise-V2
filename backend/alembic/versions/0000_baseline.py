"""baseline schema (users, policies, applications, notifications, favourites, chat_messages)

Revision ID: 0000_baseline
Revises:
Create Date: 2026-09-15

This migration exists to make the Alembic history self-sufficient. Before
this project adopted Alembic, these tables were created by
Base.metadata.create_all() (see git history / CHANGES.md). Two situations
need to both work:

  1. A brand-new/empty database (new contributor, CI, fresh deploy):
     `alembic upgrade head` runs this migration first, then 0001, and ends
     up with the full current schema. Nothing else needed.

  2. An EXISTING database that already has these tables (created by the
     old create_all() call, before Alembic existed in this project) but
     is missing the benefit-formula columns from 0001: running this
     migration's upgrade() would fail with "relation already exists".
     For that case, tell Alembic the DB is already at this revision
     without touching it:

         alembic stamp 0000_baseline
         alembic upgrade head   # now only runs 0001 onward

     See README.md "Database setup" for which case you're in.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0000_baseline"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=True),
        sa.Column("address", sa.String(), nullable=True),
        sa.Column("nominee", sa.String(), nullable=True),
        sa.Column("avatar_url", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "policies",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("code", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=False),
        sa.Column("tagline", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("min_age", sa.Integer(), nullable=False),
        sa.Column("max_age", sa.Integer(), nullable=False),
        sa.Column("min_term", sa.Integer(), nullable=False),
        sa.Column("max_term", sa.Integer(), nullable=False),
        sa.Column("min_sum_assured", sa.Float(), nullable=False),
        sa.Column("benefits", sa.JSON(), nullable=True),
        sa.Column("eligibility", sa.JSON(), nullable=True),
        sa.Column("documents", sa.JSON(), nullable=True),
        sa.Column("featured", sa.Boolean(), nullable=True),
        sa.Column("image", sa.String(), nullable=True),
        sa.Column("rating", sa.Float(), nullable=True),
        sa.Column("popularity", sa.Integer(), nullable=True),
        sa.Column("formula_version", sa.String(), nullable=True),
        sa.Column("base_rate_per_1000", sa.Float(), nullable=True),
        sa.Column("age_factor_per_year", sa.Float(), nullable=True),
        sa.Column("age_threshold", sa.Integer(), nullable=True),
        sa.Column("term_factor_per_year", sa.Float(), nullable=True),
        sa.Column("term_threshold", sa.Integer(), nullable=True),
        sa.Column("female_discount_factor", sa.Float(), nullable=True),
        sa.Column("half_yearly_loading", sa.Float(), nullable=True),
        sa.Column("quarterly_loading", sa.Float(), nullable=True),
        sa.Column("monthly_loading", sa.Float(), nullable=True),
        sa.Column("extra_formula_params", sa.JSON(), nullable=True),
    )

    op.create_table(
        "applications",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("policy_id", sa.String(), sa.ForeignKey("policies.id"), nullable=False),
        sa.Column("policy_name", sa.String(), nullable=False),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("applied_date", sa.Date(), nullable=True),
        sa.Column("agent_name", sa.String(), nullable=True),
        sa.Column("agent_phone", sa.String(), nullable=True),
        sa.Column("agent_email", sa.String(), nullable=True),
        sa.Column("timeline", sa.JSON(), nullable=True),
    )

    op.create_table(
        "notifications",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("type", sa.String(), nullable=True),
        sa.Column("read", sa.Boolean(), nullable=True),
        sa.Column("date", sa.Date(), nullable=True),
    )

    op.create_table(
        "favourites",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("policy_id", sa.String(), sa.ForeignKey("policies.id"), nullable=False),
    )

    op.create_table(
        "chat_messages",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("sources", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("chat_messages")
    op.drop_table("favourites")
    op.drop_table("notifications")
    op.drop_table("applications")
    op.drop_table("policies")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
