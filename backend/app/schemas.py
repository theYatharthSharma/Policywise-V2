from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------- Auth / User ----------

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    nominee: Optional[str] = None
    avatar_url: Optional[str] = None


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    nominee: Optional[str] = None
    avatar_url: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Policy ----------

PolicyCategory = Literal["Term", "Endowment", "ULIP", "Pension", "Child", "Health"]


class PolicyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    code: str
    category: str
    tagline: str
    description: str
    min_age: int
    max_age: int
    min_term: int
    max_term: int
    min_sum_assured: float
    benefits: list[str]
    eligibility: list[str]
    documents: list[str]
    featured: bool
    image: Optional[str] = None
    rating: float
    popularity: int


class PolicyFormulaUpdate(BaseModel):
    """Used when you plug in the real actuarial PREMIUM formula for a policy."""
    formula_version: Optional[str] = None
    base_rate_per_1000: Optional[float] = None
    age_factor_per_year: Optional[float] = None
    age_threshold: Optional[int] = None
    term_factor_per_year: Optional[float] = None
    term_threshold: Optional[int] = None
    female_discount_factor: Optional[float] = None
    half_yearly_loading: Optional[float] = None
    quarterly_loading: Optional[float] = None
    monthly_loading: Optional[float] = None
    extra_formula_params: Optional[dict] = None


# ---------- Policy benefit formula (death/maturity/GA/bonus) ----------
# Separate from PolicyFormulaUpdate above: that one governs what the
# customer PAYS (premium); this one governs what LIC PAYS OUT on
# death/maturity, sourced from LIC's plan-introduction circulars.
# Field/attribute names below match models.Policy.guaranteed_additions /
# models.Policy.bonus_declarations exactly, so from_attributes works.

class PolicyBenefitFormulaUpdate(BaseModel):
    plan_no: Optional[int] = None
    plan_family: Optional[Literal["par", "non_par"]] = None
    death_benefit_type: Optional[Literal["simple_multiplier", "income_plus_lumpsum", "dual_option"]] = None
    ppt_rule: Optional[dict | str] = None
    bsa_multiplier: Optional[float] = None
    death_sa_multiplier: Optional[float] = None
    floor_pct_of_premiums: Optional[float] = None
    death_benefit_options: Optional[dict] = None
    modal_adjustment_factors: Optional[dict] = None


class GuaranteedAdditionsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    base_rate_pct: Optional[float] = None
    rate_table: Optional[list] = None
    incentives: Optional[list] = None
    flat_rate_per_1000_bsa: Optional[float] = None


class GuaranteedAdditionsUpdate(BaseModel):
    """Upserts the Guaranteed Additions rule for a non-par policy."""
    base_rate_pct: Optional[float] = None
    rate_table: Optional[list] = None
    incentives: Optional[list] = None
    flat_rate_per_1000_bsa: Optional[float] = None


class BonusDeclarationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    declared_year: int
    simple_reversionary_bonus_rate: Optional[float] = None
    final_additional_bonus_rate: Optional[float] = None
    notes: Optional[str] = None
    declared_by: Optional[str] = None


class BonusDeclarationCreate(BaseModel):
    """Adds/updates a par policy's admin-declared bonus rate for a given
    financial year. Not computable -- must be entered from LIC's separate
    annual bonus circular."""
    declared_year: int
    simple_reversionary_bonus_rate: Optional[float] = None
    final_additional_bonus_rate: Optional[float] = None
    notes: Optional[str] = None
    declared_by: Optional[str] = None


class PolicyBenefitDetailOut(BaseModel):
    """Full benefit-formula picture for a single policy -- everything
    needed to compute/display Death SA, Maturity SA, GA, and bonus."""
    model_config = ConfigDict(from_attributes=True)
    id: str
    plan_no: Optional[int] = None
    plan_family: Optional[str] = None
    death_benefit_type: Optional[str] = None
    ppt_rule: Optional[dict | str] = None
    bsa_multiplier: Optional[float] = None
    death_sa_multiplier: Optional[float] = None
    floor_pct_of_premiums: Optional[float] = None
    death_benefit_options: Optional[dict] = None
    modal_adjustment_factors: Optional[dict] = None
    guaranteed_additions: Optional[GuaranteedAdditionsOut] = None
    bonus_declarations: list[BonusDeclarationOut] = []


# ---------- Calculator ----------

class PremiumInput(BaseModel):
    age: int
    gender: Literal["Male", "Female", "Other"]
    policy_id: str
    term: int
    sum_assured: float


class PremiumEstimate(BaseModel):
    yearly: float
    half_yearly: float
    quarterly: float
    monthly: float
    formula_version: str


# ---------- Application ----------

class ApplicationCreate(BaseModel):
    policy_id: str


class TimelineEntry(BaseModel):
    label: str
    date: str
    done: bool


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    policy_id: str
    policy_name: str
    status: str
    applied_date: date
    agent_name: Optional[str] = None
    agent_phone: Optional[str] = None
    agent_email: Optional[str] = None
    timeline: list[dict]


class ApplicationStatusUpdate(BaseModel):
    status: Literal["Pending", "Approved", "Rejected", "Under Review"]


# ---------- Notification ----------

class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    body: str
    type: str
    read: bool
    date: date


# ---------- Favourite ----------

class FavouriteCreate(BaseModel):
    policy_id: str


# ---------- Chat ----------

class ChatSend(BaseModel):
    message: str


class ChatSourceOut(BaseModel):
    title: str
    url: Optional[str] = None


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    role: str
    content: str
    created_at: datetime
    sources: list[dict] = []


class ChatReply(BaseModel):
    reply: ChatMessageOut
    history: list[ChatMessageOut]
