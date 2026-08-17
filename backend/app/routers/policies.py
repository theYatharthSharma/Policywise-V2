from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/policies", tags=["policies"])


@router.get("", response_model=list[schemas.PolicyOut])
def list_policies(
    q: str | None = Query(default=None, description="Free-text search"),
    category: str | None = Query(default=None),
    age: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Policy)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(
            (models.Policy.name.ilike(like))
            | (models.Policy.tagline.ilike(like))
            | (models.Policy.description.ilike(like))
            | (models.Policy.category.ilike(like))
        )
    if category and category.lower() != "all":
        query = query.filter(models.Policy.category == category)
    if age is not None:
        query = query.filter(models.Policy.min_age <= age, models.Policy.max_age >= age)
    return query.order_by(models.Policy.popularity.desc()).all()


@router.get("/featured", response_model=list[schemas.PolicyOut])
def featured_policies(db: Session = Depends(get_db)):
    return db.query(models.Policy).filter(models.Policy.featured.is_(True)).all()


@router.get("/{policy_id}", response_model=schemas.PolicyOut)
def get_policy(policy_id: str, db: Session = Depends(get_db)):
    policy = db.get(models.Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.get("/{policy_id}/related", response_model=list[schemas.PolicyOut])
def related_policies(policy_id: str, db: Session = Depends(get_db)):
    policy = db.get(models.Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return (
        db.query(models.Policy)
        .filter(models.Policy.category == policy.category, models.Policy.id != policy_id)
        .limit(3)
        .all()
    )


@router.patch("/{policy_id}/formula", response_model=schemas.PolicyOut)
def update_policy_formula(
    policy_id: str, payload: schemas.PolicyFormulaUpdate, db: Session = Depends(get_db)
):
    """
    Update a policy's PREMIUM-calculation formula/coefficients (what the
    customer pays). This is the endpoint to call once you have the real
    LIC tabular premium rates for a plan — no code deploy required.
    """
    policy = db.get(models.Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(policy, field, value)
    db.commit()
    db.refresh(policy)
    return policy


@router.get("/{policy_id}/benefit-formula", response_model=schemas.PolicyBenefitDetailOut)
def get_policy_benefit_formula(policy_id: str, db: Session = Depends(get_db)):
    """
    Read a policy's BENEFIT-calculation formula (what LIC pays out on
    death/maturity) — Death SA multiplier, Guaranteed Additions rule,
    and bonus declaration history, sourced from LIC's plan circulars.
    """
    policy = db.get(models.Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return policy


@router.patch("/{policy_id}/benefit-formula", response_model=schemas.PolicyBenefitDetailOut)
def update_policy_benefit_formula(
    policy_id: str, payload: schemas.PolicyBenefitFormulaUpdate, db: Session = Depends(get_db)
):
    """
    Update a policy's BENEFIT-calculation formula. Separate from
    /formula above — that one is premium (what the customer pays), this
    one is death/maturity/GA/bonus (what LIC pays out).
    """
    policy = db.get(models.Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(policy, field, value)
    db.commit()
    db.refresh(policy)
    return policy


@router.put("/{policy_id}/guaranteed-additions", response_model=schemas.GuaranteedAdditionsOut)
def upsert_guaranteed_additions_rule(
    policy_id: str, payload: schemas.GuaranteedAdditionsUpdate, db: Session = Depends(get_db)
):
    """Create or update the Guaranteed Additions rule for a (non-par) policy."""
    policy = db.get(models.Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    rule = policy.guaranteed_additions
    if rule is None:
        rule = models.GuaranteedAdditionsRule(policy_id=policy_id)
        db.add(rule)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(rule, field, value)
    db.commit()
    db.refresh(rule)
    return rule


@router.post("/{policy_id}/bonus-declarations", response_model=schemas.BonusDeclarationOut)
def add_bonus_declaration(
    policy_id: str, payload: schemas.BonusDeclarationCreate, db: Session = Depends(get_db)
):
    """
    Record LIC's annually-declared bonus rate for a (par) policy. This is
    NOT computed — it comes from LIC's separate annual bonus circular and
    must be entered manually each year.
    """
    policy = db.get(models.Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    existing = (
        db.query(models.BonusDeclaration)
        .filter_by(policy_id=policy_id, declared_year=payload.declared_year)
        .first()
    )
    if existing:
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return existing

    declaration = models.BonusDeclaration(policy_id=policy_id, **payload.model_dump())
    db.add(declaration)
    db.commit()
    db.refresh(declaration)
    return declaration
