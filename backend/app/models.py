import uuid
from datetime import datetime, date

from sqlalchemy import (
    String, Integer, Float, Boolean, Date, DateTime, ForeignKey, JSON, Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def gen_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    full_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str | None] = mapped_column(String, nullable=True)
    address: Mapped[str | None] = mapped_column(String, nullable=True)
    nominee: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    applications: Mapped[list["Application"]] = relationship(back_populates="user")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")
    chat_messages: Mapped[list["ChatMessage"]] = relationship(back_populates="user")
    favourites: Mapped[list["Favourite"]] = relationship(back_populates="user")


class Policy(Base):
    """
    Premium formula fields are intentionally stored as data, not code.
    Today they hold the same placeholder/illustrative coefficients used
    by the old frontend mock (calculator.service.ts). Replace the values
    in these columns with the real LIC actuarial formula per policy —
    no code changes or redeploy needed.

    Benefit formula fields (further down) are a SEPARATE, additive concern:
    the premium fields above compute what the customer PAYS; the benefit
    fields compute what LIC PAYS OUT on death/maturity. Sourced from LIC's
    plan-introduction circulars. Populated via PATCH /policies/{id}/benefit-formula.
    """
    __tablename__ = "policies"

    id: Mapped[str] = mapped_column(String, primary_key=True)  # slug, e.g. "jeevan-anand"
    name: Mapped[str] = mapped_column(String, nullable=False)
    code: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[str] = mapped_column(String, nullable=False)  # Term/Endowment/ULIP/Pension/Child/Health
    tagline: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    min_age: Mapped[int] = mapped_column(Integer, nullable=False)
    max_age: Mapped[int] = mapped_column(Integer, nullable=False)
    min_term: Mapped[int] = mapped_column(Integer, nullable=False)
    max_term: Mapped[int] = mapped_column(Integer, nullable=False)
    min_sum_assured: Mapped[float] = mapped_column(Float, nullable=False)

    benefits: Mapped[list] = mapped_column(JSON, default=list)
    eligibility: Mapped[list] = mapped_column(JSON, default=list)
    documents: Mapped[list] = mapped_column(JSON, default=list)

    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    image: Mapped[str | None] = mapped_column(String, nullable=True)
    rating: Mapped[float] = mapped_column(Float, default=0)
    popularity: Mapped[int] = mapped_column(Integer, default=0)

    # --- Premium formula config (swap these for the real formula) ---
    formula_version: Mapped[str] = mapped_column(String, default="placeholder-v1")
    base_rate_per_1000: Mapped[float] = mapped_column(Float, default=3.8)
    age_factor_per_year: Mapped[float] = mapped_column(Float, default=0.018)
    age_threshold: Mapped[int] = mapped_column(Integer, default=25)
    term_factor_per_year: Mapped[float] = mapped_column(Float, default=0.004)
    term_threshold: Mapped[int] = mapped_column(Integer, default=30)
    female_discount_factor: Mapped[float] = mapped_column(Float, default=0.93)
    half_yearly_loading: Mapped[float] = mapped_column(Float, default=1.02)
    quarterly_loading: Mapped[float] = mapped_column(Float, default=1.035)
    monthly_loading: Mapped[float] = mapped_column(Float, default=1.05)
    # free-form bucket for any extra actuarial params (riders, GST slabs, etc.)
    extra_formula_params: Mapped[dict] = mapped_column(JSON, default=dict)

    # --- Benefit formula config (NEW, additive) ---
    plan_no: Mapped[int | None] = mapped_column(Integer, unique=True, index=True, nullable=True)  # LIC's official plan number, e.g. 715
    plan_family: Mapped[str | None] = mapped_column(String, nullable=True)  # "par" | "non_par"
    death_benefit_type: Mapped[str | None] = mapped_column(String, nullable=True)
    # "simple_multiplier" | "income_plus_lumpsum" | "dual_option"

    # ppt_rule handles: "same_as_policy_term", "policy_term_minus_3",
    # "single_premium", {"fixed_combos": [...]}, {"allowed_values": [6,8,10,12]}
    ppt_rule: Mapped[dict | str | None] = mapped_column(JSON, nullable=True)

    bsa_multiplier: Mapped[float | None] = mapped_column(Float, nullable=True)          # e.g. 1.0, 1.25
    death_sa_multiplier: Mapped[float | None] = mapped_column(Float, nullable=True)     # e.g. 7, 10
    floor_pct_of_premiums: Mapped[float | None] = mapped_column(Float, nullable=True)   # e.g. 1.05

    # For income_plus_lumpsum and dual_option plans, and anything that
    # doesn't reduce to a single multiplier pair (see seed data per plan).
    death_benefit_options: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Only non-null where the modal loading differs from a project-wide
    # default (plans 881, 912 in the reviewed circulars).
    modal_adjustment_factors: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    guaranteed_additions: Mapped["GuaranteedAdditionsRule | None"] = relationship(
        back_populates="policy", uselist=False, cascade="all, delete-orphan"
    )
    bonus_declarations: Mapped[list["BonusDeclaration"]] = relationship(
        back_populates="policy", cascade="all, delete-orphan",
        order_by="BonusDeclaration.declared_year.desc()"
    )


class GuaranteedAdditionsRule(Base):
    """
    Non-par plans only (868 has none; 881/911/912 do). One row per Policy
    — this is a plan-level rule, not a customer-level one.
    """
    __tablename__ = "guaranteed_additions_rules"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    policy_id: Mapped[str] = mapped_column(String, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False, unique=True)

    base_rate_pct: Mapped[float | None] = mapped_column(Float, nullable=True)  # e.g. 7.00 for plan 881

    # For plans where the base rate varies by policy term (e.g. plan 912:
    # 8.5% / 9.0% / 9.5% by PT band): [{"pt_min":10,"pt_max":13,"rate":8.5}, ...]
    rate_table: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # Additive incentives: high-BSA bands, CIS/online sale, existing-policyholder bumps.
    incentives: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # For plans with a flat, non-premium-linked GA (e.g. plan 911: Rs.85 per
    # Rs.1000 BSA per year), use this instead of base_rate_pct.
    flat_rate_per_1000_bsa: Mapped[float | None] = mapped_column(Float, nullable=True)

    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    policy: Mapped["Policy"] = relationship(back_populates="guaranteed_additions")


class BonusDeclaration(Base):
    """
    Par plans only. UNLIKE GuaranteedAdditionsRule, this is NOT a static
    formula — LIC declares a new rate annually, so this table holds
    HISTORY (one row per policy per declared_year). Application code
    should pull the row with the latest declared_year unless computing a
    historical illustration.
    """
    __tablename__ = "bonus_declarations"
    __table_args__ = (
        UniqueConstraint("policy_id", "declared_year", name="uq_bonus_policy_year"),
    )

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    policy_id: Mapped[str] = mapped_column(String, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False)

    declared_year: Mapped[int] = mapped_column(Integer, nullable=False)  # financial year, e.g. 2025 for FY2024-25

    # Simple Reversionary Bonus rate — typically Rs. per 1000 SA per year
    # in LIC's actual bonus circulars (NOT present in the plan-intro
    # circulars this schema was seeded from — those only describe the
    # mechanism, not the rate).
    simple_reversionary_bonus_rate: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Final Additional Bonus, payable only on claim (death/maturity).
    final_additional_bonus_rate: Mapped[float | None] = mapped_column(Float, nullable=True)

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    declared_by: Mapped[str | None] = mapped_column(String, nullable=True)  # admin user who entered it
    declared_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    policy: Mapped["Policy"] = relationship(back_populates="bonus_declarations")


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    policy_id: Mapped[str] = mapped_column(String, ForeignKey("policies.id"), nullable=False)
    policy_name: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="Pending")  # Pending/Approved/Rejected/Under Review
    applied_date: Mapped[date] = mapped_column(Date, default=date.today)

    agent_name: Mapped[str | None] = mapped_column(String, nullable=True)
    agent_phone: Mapped[str | None] = mapped_column(String, nullable=True)
    agent_email: Mapped[str | None] = mapped_column(String, nullable=True)

    timeline: Mapped[list] = mapped_column(JSON, default=list)

    user: Mapped["User"] = relationship(back_populates="applications")


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[str] = mapped_column(String, default="info")  # info/success/warning
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    date: Mapped[date] = mapped_column(Date, default=date.today)

    user: Mapped["User"] = relationship(back_populates="notifications")


class Favourite(Base):
    __tablename__ = "favourites"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    policy_id: Mapped[str] = mapped_column(String, ForeignKey("policies.id"), nullable=False)

    user: Mapped["User"] = relationship(back_populates="favourites")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=gen_uuid)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    role: Mapped[str] = mapped_column(String, nullable=False)  # user/assistant
    content: Mapped[str] = mapped_column(Text, nullable=False)
    sources: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="chat_messages")
