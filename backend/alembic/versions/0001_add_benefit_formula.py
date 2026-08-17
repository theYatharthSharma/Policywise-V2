"""add benefit formula fields (death SA, guaranteed additions, bonus)

Revision ID: 0001_add_benefit_formula
Revises:
Create Date: 2026-08-09

This is the FIRST Alembic migration for this project. Your existing
tables (policies, users, applications, ...) were created previously via
Base.metadata.create_all() in app/seed_data.py, not via Alembic. This
migration is purely ADDITIVE (new columns + two new tables) so it's safe
to run directly against that already-existing database -- nothing here
touches or recreates a table that already exists.

Matches app/models.py exactly as of this migration:
  - Policy gets 9 new nullable columns (plan_no, plan_family,
    death_benefit_type, ppt_rule, bsa_multiplier, death_sa_multiplier,
    floor_pct_of_premiums, death_benefit_options, modal_adjustment_factors)
  - New table guaranteed_additions_rules (1:1 with Policy, String UUID PK
    to match this project's existing convention -- policies.id is a
    String slug, not an Integer)
  - New table bonus_declarations (1:many with Policy, String UUID PK)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0001_add_benefit_formula"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- Extend policies table with benefit-formula columns ---
    op.add_column("policies", sa.Column("plan_no", sa.Integer(), nullable=True))
    op.create_index("ix_policies_plan_no", "policies", ["plan_no"], unique=True)
    op.add_column("policies", sa.Column("plan_family", sa.String(), nullable=True))
    op.add_column("policies", sa.Column("death_benefit_type", sa.String(), nullable=True))
    op.add_column("policies", sa.Column("ppt_rule", sa.JSON(), nullable=True))
    op.add_column("policies", sa.Column("bsa_multiplier", sa.Float(), nullable=True))
    op.add_column("policies", sa.Column("death_sa_multiplier", sa.Float(), nullable=True))
    op.add_column("policies", sa.Column("floor_pct_of_premiums", sa.Float(), nullable=True))
    op.add_column("policies", sa.Column("death_benefit_options", sa.JSON(), nullable=True))
    op.add_column("policies", sa.Column("modal_adjustment_factors", sa.JSON(), nullable=True))

    # --- New table: guaranteed_additions_rules ---
    op.create_table(
        "guaranteed_additions_rules",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("policy_id", sa.String(), sa.ForeignKey("policies.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("base_rate_pct", sa.Float(), nullable=True),
        sa.Column("rate_table", sa.JSON(), nullable=True),
        sa.Column("incentives", sa.JSON(), nullable=True),
        sa.Column("flat_rate_per_1000_bsa", sa.Float(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
    )

    # --- New table: bonus_declarations ---
    op.create_table(
        "bonus_declarations",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("policy_id", sa.String(), sa.ForeignKey("policies.id", ondelete="CASCADE"), nullable=False),
        sa.Column("declared_year", sa.Integer(), nullable=False),
        sa.Column("simple_reversionary_bonus_rate", sa.Float(), nullable=True),
        sa.Column("final_additional_bonus_rate", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("declared_by", sa.String(), nullable=True),
        sa.Column("declared_at", sa.DateTime(), nullable=True),
        sa.UniqueConstraint("policy_id", "declared_year", name="uq_bonus_policy_year"),
    )


def downgrade() -> None:
    op.drop_table("bonus_declarations")
    op.drop_table("guaranteed_additions_rules")

    op.drop_column("policies", "modal_adjustment_factors")
    op.drop_column("policies", "death_benefit_options")
    op.drop_column("policies", "floor_pct_of_premiums")
    op.drop_column("policies", "death_sa_multiplier")
    op.drop_column("policies", "bsa_multiplier")
    op.drop_column("policies", "ppt_rule")
    op.drop_column("policies", "death_benefit_type")
    op.drop_column("policies", "plan_family")
    op.drop_index("ix_policies_plan_no", table_name="policies")
    op.drop_column("policies", "plan_no")
