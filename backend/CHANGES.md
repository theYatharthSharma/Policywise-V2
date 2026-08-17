# PolicyWise Backend — Benefit Formula Update

This zip is your `policywise_backend/policywise_backend/` folder with the
benefit-calculation schema added. Drop it in over your existing backend
folder (or diff it against your copy — nothing outside what's listed below
was touched).

## What changed

### `app/models.py`
- Added 9 new nullable columns to `Policy`: `plan_no`, `plan_family`,
  `death_benefit_type`, `ppt_rule`, `bsa_multiplier`, `death_sa_multiplier`,
  `floor_pct_of_premiums`, `death_benefit_options`, `modal_adjustment_factors`.
- Added two new tables: `GuaranteedAdditionsRule` (1:1 with Policy, non-par
  plans only) and `BonusDeclaration` (1:many with Policy, par plans only,
  holds year-by-year history since LIC declares this rate annually).
- **Nothing about the existing premium-calculation columns changed.**

### `app/schemas.py`
- Added `PolicyBenefitFormulaUpdate`, `GuaranteedAdditionsOut`/`Update`,
  `BonusDeclarationOut`/`Create`, `PolicyBenefitDetailOut`.
- `PolicyOut` is **unchanged** — benefit-formula data is served through the
  new `/benefit-formula` endpoint, not bolted onto the main policy list.

### `app/routers/policies.py`
- New endpoints (all tested, see below):
  - `GET /policies/{id}/benefit-formula` — read Death SA/Maturity SA/GA/bonus config
  - `PATCH /policies/{id}/benefit-formula` — update it
  - `PUT /policies/{id}/guaranteed-additions` — upsert GA rule (non-par plans)
  - `POST /policies/{id}/bonus-declarations` — record a par plan's annual bonus rate
- Existing `/formula` (premium) endpoint is untouched.

### `alembic.ini`, `alembic/env.py`, `alembic/script.py.mako`, `alembic/versions/0001_add_benefit_formula.py`
- First Alembic migration for this project (you weren't using Alembic
  before — tables were created via `Base.metadata.create_all()`). This
  migration is purely additive and safe to run on your existing DB.

### `app/seed_lic_plans.py` (new file)
- Updates `jeevan-anand` and `new-endowment` in place to match the new
  Oct-2024 circular (new min sum assured, new UIN-era plan numbers 715/714).
- Creates 6 new Policy rows: `jeevan-lakshya` (733), `jeevan-labh` (736),
  `jeevan-azad` (868), `bima-lakshmi` (881), `nav-jeevan-shree-single` (911),
  `nav-jeevan-shree` (912). **Their tagline/description/benefits/eligibility
  are DRAFT placeholder copy — rewrite before shipping.**
  Everything with `[DRAFT]` in the description needs your review.
- Upserts Guaranteed Additions rules for the 3 non-par plans that have one
  (881, 911, 912) — plan 868 correctly gets none, it has no GA per its circular.
  Idempotent — safe to run more than once.
- Creates placeholder `BonusDeclaration` rows (rate fields left `NULL`) for
  all 4 par plans for FY2025, so nothing is silently missing. **The actual
  bonus rate is not in the circular PDF you gave me** — LIC publishes that
  separately every year. Someone needs to enter it via
  `POST /policies/{id}/bonus-declarations`.

## How to apply this to your real database

```bash
# 1. From your backend folder (with venv activated)
pip install -r requirements.txt   # picks up alembic if you didn't have it

# 2. Run the migration against your actual Postgres DB
alembic upgrade head

# 3. Seed the 8 LIC plans (safe to re-run)
python -m app.seed_lic_plans
```

## What I verified before sending this (not just written, actually run)

- `app/models.py` — imported cleanly, all tables (including the 2 new ones)
  created against a live SQLite DB, relationship round-trip tested
  (`Policy.guaranteed_additions`, `Policy.bonus_declarations`).
- `app/schemas.py` — every new Pydantic schema validated against real
  SQLAlchemy model instances via `model_validate()`, including nested
  `GuaranteedAdditionsOut`.
- `app/routers/policies.py` — all 4 new endpoints (and the 2 pre-existing
  ones) hit via `FastAPI TestClient` end-to-end: PATCH benefit-formula, GET
  benefit-formula, PUT guaranteed-additions, POST bonus-declarations, plus
  confirming the old `/formula` and plain `GET /policies/{id}` still work
  unmodified.
- `alembic/versions/0001_add_benefit_formula.py` — `upgrade()` and
  `downgrade()` both executed against a simulated pre-migration schema with
  a pre-existing row, confirmed columns/tables appear and disappear
  correctly and the existing row survives untouched.
- **Full pipeline**: simulated your actual current production DB (old
  schema, 7 policies) → ran the Alembic migration → ran
  `seed_lic_plans.py` → confirmed all 13 final policy rows, correct
  GA/bonus wiring per plan, and **re-ran the seed script a second time to
  confirm it's idempotent** (no duplicates, no errors).

## Known pre-existing issue (not mine, but you'll hit it)

`app/seed_data.py`'s demo-user creation fails with newer `bcrypt` versions
(`passlib` 1.7.4 + `bcrypt` ≥4.1 have a known incompatibility — unrelated to
anything in this change). If `python -m app.seed_data` errors on
`hash_password`, pin `bcrypt<4.1` in `requirements.txt`.
