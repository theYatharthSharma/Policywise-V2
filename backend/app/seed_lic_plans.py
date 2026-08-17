"""
Seeds/upserts BENEFIT-formula data (Death SA, Maturity SA, Guaranteed
Additions, bonus mechanism) for all 8 LIC plans covered in the Oct-2025
circular compilation: 714, 715, 733, 736, 868, 881, 911, 912.

This is SEPARATE from app/seed_data.py, which seeds the original 7
placeholder products (with PREMIUM formula placeholders) and demo user.
Run this AFTER seed_data.py and AFTER `alembic upgrade head`.

What this does:
  - jeevan-anand (currently LIC-915/old-715) and new-endowment (currently
    LIC-914/old-714) are UPDATED IN PLACE to match the new Oct-2024
    circular (new min SA, new UIN-era code, benefit-formula fields).
  - 6 NEW Policy rows are CREATED for the plans with no existing row:
    jeevan-lakshya (733), jeevan-labh (736), jeevan-azad (868),
    bima-lakshmi (881), nav-jeevan-shree-single (911), nav-jeevan-shree (912).
    Their tagline/description/benefits/eligibility/documents are DRAFT
    placeholder copy -- rewrite before shipping to production.
  - Guaranteed Additions rules are upserted for the 3 non-par plans that
    have them (881, 911, 912). Plan 868 is non-par but has NO guaranteed
    additions per its circular, so it's intentionally skipped.
  - A placeholder BonusDeclaration row (rate fields NULL) is created for
    each par plan (714, 715, 733, 736) for the current financial year,
    so nothing falls through silently -- an admin still needs to enter
    the real declared rate from LIC's separate annual bonus circular.

Run with:  python -m app.seed_lic_plans
"""
from app.database import Base, engine, SessionLocal
from app import models

CURRENT_FY = 2025

# ---------------------------------------------------------------------------
# Updates to the 2 existing rows (old pre-Oct-2024 versions -> new circular)
# ---------------------------------------------------------------------------
EXISTING_UPDATES = {
    "jeevan-anand": dict(
        code="LIC-715",
        min_age=18, max_age=50, min_term=15, max_term=35, min_sum_assured=200000,
        plan_no=715, plan_family="par", death_benefit_type="simple_multiplier",
        bsa_multiplier=1.25, death_sa_multiplier=7, floor_pct_of_premiums=1.05,
        ppt_rule={"type": "same_as_policy_term"},
        death_benefit_options={"post_maturity_death_sa": "basic_sum_assured"},
    ),
    "new-endowment": dict(
        code="LIC-714",
        min_age=8, max_age=50, min_term=12, max_term=35, min_sum_assured=200000,
        plan_no=714, plan_family="par", death_benefit_type="simple_multiplier",
        bsa_multiplier=1.0, death_sa_multiplier=7, floor_pct_of_premiums=1.05,
        ppt_rule={"type": "same_as_policy_term"},
    ),
}

# ---------------------------------------------------------------------------
# 6 new Policy rows. Marketing copy below is DRAFT/PLACEHOLDER -- rewrite
# tagline/description/benefits/eligibility/documents before production use.
# ---------------------------------------------------------------------------
NEW_POLICIES = [
    dict(
        id="jeevan-lakshya", code="LIC-733", name="LIC Jeevan Lakshya", category="Endowment",
        tagline="Income for your family, a lumpsum for your goals",
        description="[DRAFT] A participating plan that pays an annual income benefit to the family "
                     "from the date of the policyholder's death until maturity, plus a lumpsum on "
                     "maturity regardless of survival.",
        min_age=18, max_age=50, min_term=13, max_term=25, min_sum_assured=200000,
        benefits=["Annual income benefit on death", "Lumpsum at maturity", "Bonus participation"],
        eligibility=["Age 18-50 years", "Minimum sum assured Rs.2,00,000"],
        documents=["Aadhaar / PAN", "Address proof", "Income proof"],
        featured=False, rating=0, popularity=0,
        plan_no=733, plan_family="par", death_benefit_type="income_plus_lumpsum",
        floor_pct_of_premiums=1.05,
        ppt_rule={"type": "policy_term_minus_3"},
        death_benefit_options={
            "annual_income_pct_of_bsa": 0.10,
            "income_payable_from": "death_anniversary",
            "income_payable_until": "anniversary_before_maturity",
            "lumpsum_pct_of_bsa_at_maturity": 1.10,
        },
    ),
    dict(
        id="jeevan-labh", code="LIC-736", name="LIC Jeevan Labh", category="Endowment",
        tagline="Limited premiums, lifelong-style savings and protection",
        description="[DRAFT] A participating limited premium payment endowment plan combining "
                     "savings and protection, with fixed policy term / premium paying term "
                     "combinations.",
        min_age=8, max_age=59, min_term=16, max_term=25, min_sum_assured=200000,
        benefits=["Bonus participation", "Fixed PT/PPT combinations", "Loan facility"],
        eligibility=["Age 8-59 years (varies by term)", "Minimum sum assured Rs.2,00,000"],
        documents=["Aadhaar / PAN", "Address proof", "Income proof"],
        featured=False, rating=0, popularity=0,
        plan_no=736, plan_family="par", death_benefit_type="simple_multiplier",
        bsa_multiplier=1.0, death_sa_multiplier=7, floor_pct_of_premiums=1.05,
        ppt_rule={"fixed_combos": [
            {"policy_term": 16, "ppt": 10, "max_entry_age": 59},
            {"policy_term": 21, "ppt": 15, "max_entry_age": 54},
            {"policy_term": 25, "ppt": 16, "max_entry_age": 50},
        ]},
    ),
    dict(
        id="jeevan-azad", code="LIC-868", name="LIC Jeevan Azad", category="Endowment",
        tagline="Simple limited-premium savings, no medical hassle up to Rs.3L",
        description="[DRAFT] A non-participating limited premium endowment plan with premium "
                     "paying term fixed at policy term minus 8 years, and no guaranteed additions.",
        min_age=0, max_age=50, min_term=15, max_term=20, min_sum_assured=200000,
        benefits=["Simplified underwriting up to Rs.3,00,000", "Fixed 105% premium-paid floor"],
        eligibility=["Age 90 days-50 years", "Basic sum assured capped at Rs.3,00,000 per life"],
        documents=["Aadhaar / PAN", "Address proof"],
        featured=False, rating=0, popularity=0,
        plan_no=868, plan_family="non_par", death_benefit_type="simple_multiplier",
        bsa_multiplier=1.0, death_sa_multiplier=7, floor_pct_of_premiums=1.05,
        ppt_rule={"type": "policy_term_minus_8"},
        death_benefit_options={"pre_risk_commencement_minor_death": "refund_of_premiums_paid_no_interest"},
    ),
    dict(
        id="bima-lakshmi", code="LIC-881", name="LIC Bima Lakshmi", category="Endowment",
        tagline="A savings plan designed exclusively for women",
        description="[DRAFT] A non-participating, non-linked savings plan for female lives only, "
                     "offering Guaranteed Additions and a choice of three survival benefit payout "
                     "schedules.",
        min_age=18, max_age=50, min_term=25, max_term=25, min_sum_assured=200000,
        benefits=["Guaranteed Additions each year", "3 survival benefit payout options",
                  "Female Critical Illness rider available"],
        eligibility=["Female lives only", "Age 18-50 years", "PPT 7-15 years"],
        documents=["Aadhaar / PAN", "Address proof", "Income proof"],
        featured=False, rating=0, popularity=0,
        plan_no=881, plan_family="non_par", death_benefit_type="simple_multiplier",
        bsa_multiplier=1.0, death_sa_multiplier=10, floor_pct_of_premiums=1.05,
        ppt_rule={"min": 7, "max": 15},
        death_benefit_options={"female_only": True, "survival_benefit_options": ["A", "B", "C"]},
        modal_adjustment_factors={"yearly": 1.0000, "half_yearly": 1.0180, "quarterly": 1.0272, "monthly": 1.0332},
    ),
    dict(
        id="nav-jeevan-shree-single", code="LIC-911", name="LIC Nav Jeevan Shree (Single Premium)",
        category="Endowment",
        tagline="One-time payment, guaranteed additions every year",
        description="[DRAFT] A single-premium, non-participating endowment plan with a choice of "
                     "two death benefit options and a flat guaranteed addition rate.",
        min_age=0, max_age=60, min_term=5, max_term=20, min_sum_assured=100000,
        benefits=["Single premium, no renewals", "Flat Rs.85/1000 BSA guaranteed addition",
                  "Choice of 2 death benefit options"],
        eligibility=["Age 30 days-60 years (Option I) / up to 40 years (Option II)"],
        documents=["Aadhaar / PAN", "Address proof"],
        featured=False, rating=0, popularity=0,
        plan_no=911, plan_family="non_par", death_benefit_type="dual_option",
        ppt_rule={"type": "single_premium"},
        death_benefit_options={
            "option_1": {"bsa_multiplier": 1.0, "sp_multiplier": 1.25, "max_entry_age": 60},
            "option_2": {"sp_multiplier": 10, "max_entry_age": 40},
        },
    ),
    dict(
        id="nav-jeevan-shree", code="LIC-912", name="LIC Nav Jeevan Shree", category="Endowment",
        tagline="Limited premiums, guaranteed additions, your choice of cover",
        description="[DRAFT] A limited premium, non-participating endowment plan with 4 premium "
                     "paying term options and a choice of two death benefit multipliers.",
        min_age=0, max_age=60, min_term=10, max_term=20, min_sum_assured=500000,
        benefits=["Guaranteed additions (rate rises with policy term)", "PPT options of 6/8/10/12 years",
                  "Choice of 2 death benefit options"],
        eligibility=["Age 30 days-60 years", "Minimum sum assured Rs.5,00,000"],
        documents=["Aadhaar / PAN", "Address proof", "Income proof"],
        featured=False, rating=0, popularity=0,
        plan_no=912, plan_family="non_par", death_benefit_type="dual_option",
        bsa_multiplier=1.0, floor_pct_of_premiums=1.05,
        ppt_rule={"allowed_values": [6, 8, 10, 12]},
        death_benefit_options={
            "option_1": {"death_sa_multiplier": 7},
            "option_2": {"death_sa_multiplier": 10},
        },
        modal_adjustment_factors={"yearly": 1.0000, "half_yearly": 1.0186, "quarterly": 1.0280, "monthly": 1.0344},
    ),
]

# ---------------------------------------------------------------------------
# Guaranteed Additions rules (non-par plans only; 868 intentionally absent)
# ---------------------------------------------------------------------------
GUARANTEED_ADDITIONS = {
    "bima-lakshmi": dict(
        base_rate_pct=7.00,
        incentives=[
            {"type": "high_basic_sum_assured", "bands": [
                {"bsa_min": 500000, "bsa_max": 999999, "ppt_7_9": 0.25, "ppt_10_15": 0.30},
                {"bsa_min": 1000000, "bsa_max": 1499999, "ppt_7_9": 0.35, "ppt_10_15": 0.40},
                {"bsa_min": 1500000, "bsa_max": 2499999, "ppt_7_9": 0.40, "ppt_10_15": 0.45},
                {"bsa_min": 2500000, "bsa_max": None, "ppt_7_9": 0.45, "ppt_10_15": 0.50},
            ]},
            {"type": "existing_policyholder_or_nominee", "ppt_7_11": 0.05, "ppt_12_15": 0.10},
            {"type": "cis_or_online_sale", "ppt_7_9": 0.75, "ppt_10_14": 1.25, "ppt_15": 1.50},
        ],
    ),
    "nav-jeevan-shree-single": dict(
        flat_rate_per_1000_bsa=85,
    ),
    "nav-jeevan-shree": dict(
        rate_table=[
            {"pt_min": 10, "pt_max": 13, "rate": 8.50},
            {"pt_min": 14, "pt_max": 17, "rate": 9.00},
            {"pt_min": 18, "pt_max": 20, "rate": 9.50},
        ],
        incentives=[
            {"type": "existing_policyholder_or_nominee", "note": "0.05-0.15% by PPT, see circular Para 10(iv)"},
            {"type": "cis_or_online_sale", "ppt_6_8": 0.75, "ppt_10_12": 1.25},
        ],
    ),
}

# Par plans get a placeholder bonus row (both existing and new) -- id/plan_no from above
PAR_PLAN_IDS = ["jeevan-anand", "new-endowment", "jeevan-lakshya", "jeevan-labh"]


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Update the 2 existing rows in place
        for policy_id, updates in EXISTING_UPDATES.items():
            policy = db.get(models.Policy, policy_id)
            if policy is None:
                print(f"  [SKIP] '{policy_id}' not found -- run app/seed_data.py first.")
                continue
            for field, value in updates.items():
                setattr(policy, field, value)
            print(f"  [OK] Updated '{policy_id}' to new circular (plan {updates['plan_no']})")

        # 2. Create the 6 new rows (idempotent -- skip if already present)
        for p in NEW_POLICIES:
            existing = db.get(models.Policy, p["id"])
            if existing:
                print(f"  [SKIP] '{p['id']}' already exists, not overwriting.")
                continue
            db.add(models.Policy(**p))
            print(f"  [OK] Created '{p['id']}' (plan {p['plan_no']})")

        db.commit()

        # 3. Upsert Guaranteed Additions rules
        for policy_id, ga_fields in GUARANTEED_ADDITIONS.items():
            policy = db.get(models.Policy, policy_id)
            if policy is None:
                print(f"  [SKIP] GA rule for '{policy_id}' -- policy not found.")
                continue
            rule = policy.guaranteed_additions
            if rule is None:
                rule = models.GuaranteedAdditionsRule(policy_id=policy_id)
                db.add(rule)
            for field, value in ga_fields.items():
                setattr(rule, field, value)
            print(f"  [OK] Upserted guaranteed_additions_rules for '{policy_id}'")

        db.commit()

        # 4. Placeholder bonus declarations for par plans (rate left NULL --
        #    real rate must come from LIC's separate annual bonus circular)
        for policy_id in PAR_PLAN_IDS:
            policy = db.get(models.Policy, policy_id)
            if policy is None:
                continue
            existing = (
                db.query(models.BonusDeclaration)
                .filter_by(policy_id=policy_id, declared_year=CURRENT_FY)
                .first()
            )
            if existing:
                continue
            db.add(models.BonusDeclaration(
                policy_id=policy_id,
                declared_year=CURRENT_FY,
                notes="Placeholder -- actual rate must be entered from LIC's annual bonus "
                      "circular, not present in the plan-introduction circular this was seeded from.",
            ))
            print(f"  [OK] Created bonus_declarations placeholder for '{policy_id}', FY{CURRENT_FY}")

        db.commit()
        print("\nDone.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
