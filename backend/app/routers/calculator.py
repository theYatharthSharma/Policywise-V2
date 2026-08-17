from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/calculator", tags=["calculator"])


def compute_premium(policy: models.Policy, payload: schemas.PremiumInput) -> schemas.PremiumEstimate:
    """
    Premium engine. All coefficients come from the `policy` row, not
    hardcoded constants, so swapping in the real actuarial formula is a
    data update (via PATCH /policies/{id}/formula), not a code change.

    Current default coefficients reproduce the placeholder formula that
    shipped in the frontend's calculator.service.ts, purely so the app
    keeps working end-to-end until real formulas are supplied.
    """
    gender_factor = policy.female_discount_factor if payload.gender == "Female" else 1.0
    age_factor = 1 + max(0, payload.age - policy.age_threshold) * policy.age_factor_per_year
    term_factor = 1 + max(0, policy.term_threshold - payload.term) * policy.term_factor_per_year
    base = (payload.sum_assured / 1000) * policy.base_rate_per_1000

    yearly = round(base * age_factor * term_factor * gender_factor, 2)
    half_yearly = round((yearly / 2) * policy.half_yearly_loading, 2)
    quarterly = round((yearly / 4) * policy.quarterly_loading, 2)
    monthly = round((yearly / 12) * policy.monthly_loading, 2)

    return schemas.PremiumEstimate(
        yearly=yearly,
        half_yearly=half_yearly,
        quarterly=quarterly,
        monthly=monthly,
        formula_version=policy.formula_version,
    )


@router.post("/estimate", response_model=schemas.PremiumEstimate)
def estimate_premium(payload: schemas.PremiumInput, db: Session = Depends(get_db)):
    policy = db.get(models.Policy, payload.policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    if not (policy.min_age <= payload.age <= policy.max_age):
        raise HTTPException(
            status_code=400,
            detail=f"Age must be between {policy.min_age} and {policy.max_age} for this policy",
        )
    if not (policy.min_term <= payload.term <= policy.max_term):
        raise HTTPException(
            status_code=400,
            detail=f"Term must be between {policy.min_term} and {policy.max_term} years",
        )
    if payload.sum_assured < policy.min_sum_assured:
        raise HTTPException(
            status_code=400,
            detail=f"Sum assured must be at least {policy.min_sum_assured}",
        )
    return compute_premium(policy, payload)
