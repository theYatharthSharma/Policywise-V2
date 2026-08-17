# PolicyWise Backend (FastAPI + PostgreSQL)

Backend for the PolicyWise / Lovable frontend (`policywise_lovable.zip`). Replaces the
frontend's mock `localStorage`/in-memory services with a real API + database.

## Stack
- FastAPI
- SQLAlchemy 2.0 (ORM)
- PostgreSQL
- JWT auth (python-jose + passlib/bcrypt)

## Setup

```bash
# 1. Create a virtualenv (optional but recommended)
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create the Postgres database & user (adjust as needed)
psql -U postgres -c "CREATE USER policywise_user WITH PASSWORD 'policywise_pass';"
psql -U postgres -c "CREATE DATABASE policywise OWNER policywise_user;"

# 4. Configure environment
cp .env.example .env
# edit .env — set DATABASE_URL, JWT_SECRET_KEY, etc.

# 5. Seed the database (creates tables + loads the same policies/demo data
#    the old frontend mock shipped with)
python -m app.seed_data

# 6. Run the API
uvicorn app.main:app --reload
```

API docs (Swagger UI): http://127.0.0.1:8000/docs

Demo login after seeding: `demo@policywise.in` / `password123`

## Project layout

```
app/
  main.py           FastAPI app, CORS, router registration
  config.py         Settings (reads .env)
  database.py       SQLAlchemy engine/session
  models.py         ORM models: User, Policy, Application, Notification, Favourite, ChatMessage
  schemas.py        Pydantic request/response models
  auth.py           Password hashing + JWT helpers + get_current_user dependency
  seed_data.py       One-time data loader (mirrors old mockData.ts)
  routers/
    auth.py          /auth/register /auth/login /auth/me
    policies.py       /policies  ...  /policies/{id}/formula
    calculator.py      /calculator/estimate   <-- premium formula engine
    applications.py    /applications
    notifications.py   /notifications
    favourites.py       /favourites
    chat.py             /chat/send /chat/history  <-- LLM integration seam
```

## Premium formula — how updates work

Every `Policy` row stores its own formula coefficients (`base_rate_per_1000`,
`age_factor_per_year`, `term_factor_per_year`, `female_discount_factor`,
frequency loadings, plus a free-form `extra_formula_params` JSON bucket for
anything else). The calculation itself lives in
`app/routers/calculator.py::compute_premium()`.

**Today** these coefficients reproduce the illustrative/placeholder formula
that was in the old frontend's `calculator.service.ts`, so the app works
end-to-end immediately.

**When you have the real LIC actuarial formula** for a policy:
1. If it fits the same shape (base rate × age/term/gender factors + frequency
   loadings), just `PATCH /policies/{id}/formula` with the real numbers —
   zero code changes.
2. If the real formula has a fundamentally different shape (e.g. actuarial
   tables, GST slabs, rider add-ons, mortality tables), extend
   `compute_premium()` and the `Policy` model with the extra fields it needs
   — the request/response contract (`PremiumInput` / `PremiumEstimate`) can
   stay the same, so the frontend doesn't need to change.

## Chatbot — LLM integration seam

`app/routers/chat.py::generate_assistant_reply()` is the single place to
plug in a real LLM. Right now it returns the same canned replies the
frontend mock used. Swap it for a call to Claude/OpenAI, optionally with
retrieved policy rows as context (RAG) so answers are grounded in real
plan details and premiums. Persistence, the API contract, and the frontend
don't need to change.

## Notes
- `Base.metadata.create_all()` runs on startup for convenience. For a real
  production deployment, switch to Alembic migrations (scaffolded via
  `alembic` in requirements.txt but not yet initialized here).
- CORS is wide open (`allow_origins=["*"]`) — restrict to your frontend's
  origin before deploying.
