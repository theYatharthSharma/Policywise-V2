# PolicyWise Backend (FastAPI + PostgreSQL)

Backend for the PolicyWise / Lovable frontend (`policywise_lovable.zip`). Replaces the
frontend's mock `localStorage`/in-memory services with a real API + database.

## Stack
- FastAPI
- SQLAlchemy 2.0 (ORM)
- PostgreSQL
- JWT auth (python-jose + passlib/bcrypt)

## Database setup

**If this is a brand-new/empty database** (fresh clone, new machine, CI):
```bash
alembic upgrade head
```
That's it — this runs the full migration chain from scratch.

**If you already have a database from before this backend used Alembic**
(tables like `policies`/`users` already exist, e.g. this is exactly the
"database not updating" situation from earlier — the columns for `plan_no`,
`GuaranteedAdditionsRule`, etc. are missing): tell Alembic those base
tables already exist, then apply the rest:
```bash
alembic stamp 0000_baseline
alembic upgrade head
```
`stamp` does NOT run any SQL — it just marks the DB as already being at
that revision, so `upgrade head` then only runs the migrations after it
(currently just `0001_add_benefit_formula`), adding the missing columns
without touching your existing data.

Not sure which you have? Run `alembic upgrade head` first — if the tables
already exist, it'll fail loudly with "relation already exists" and you
know to use the `stamp` path instead. It will never silently do nothing.

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

# 5. Apply the database schema (THIS STEP IS NOT OPTIONAL)
alembic upgrade head

# 6. Seed the database (loads the same policies/demo data the old
#    frontend mock shipped with, plus the LIC benefit-formula plans)
python -m app.seed_data
python -m app.seed_lic_plans

# 7. Run the API
uvicorn app.main:app --reload
```

Whenever you pull new code that touches `app/models.py`, there will be a
new file under `alembic/versions/`. Run `alembic upgrade head` again before
starting the app — the app no longer creates/alters tables on its own.

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
    chat.py             /chat/send /chat/history  <-- RAG + Ollama
  rag/
    ollama_client.py    HTTP wrapper for Ollama embeddings/chat
    chunking.py          brochure text -> overlapping chunks
    ingest.py             chunks -> embeddings -> document_chunks table
    retrieve.py            pgvector cosine-similarity search
data/brochures/           manifest.json + downloaded/placed PDFs
scripts/download_brochures.py   fetches what it can from the manifest
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

## Chatbot — Ollama + RAG (local LLM, no cloud API)

The assistant answers using **retrieval-augmented generation (RAG)**: your
questions are matched against chunks of real LIC brochures stored in
Postgres (via `pgvector`), and a local Ollama model answers grounded in
whatever was retrieved — not from the model's memory. This is why it can't
invent a premium figure: if the brochure isn't ingested, it says so.

### One-time setup

```bash
# 1. Install Ollama: https://ollama.com/download
ollama pull nomic-embed-text   # embedding model, 768-dim
ollama pull llama3.1:8b        # chat model (needs a decent GPU; use a
                                # smaller model like llama3.2:3b if not)
ollama serve                   # leave running in its own terminal
```

```bash
# 2. Get the pgvector Postgres extension (Ubuntu/Debian):
sudo apt install postgresql-16-pgvector   # match your installed PG version
# (On managed/cloud Postgres, enable the "pgvector" extension from your
# provider's dashboard instead.)

# 3. Apply the new migration (adds the document_chunks table)
alembic upgrade head

# 4. Get the brochure PDFs into data/brochures/
python scripts/download_brochures.py
# This auto-downloads what it can from data/brochures/manifest.json.
# Some LIC brochure links aren't stable direct-PDF URLs — the script will
# tell you exactly which ones to grab by hand (open the page, click
# "Sales Brochure", save with the filename it prints).

# 5. Ingest the brochures (chunks + embeds them into Postgres)
python -m app.rag.ingest
```

Now `/chat/send` will retrieve real brochure content and answer through
your local Ollama model instead of the old canned replies.

### How it fits together

- `app/rag/chunking.py` — splits brochure text into overlapping ~220-word chunks
- `app/rag/ollama_client.py` — thin HTTP wrapper for Ollama's `/api/embeddings` and `/api/chat`
- `app/rag/ingest.py` — PDF → text → chunks → embeddings → `document_chunks` table (`python -m app.rag.ingest`, or `--policy <id>` for just one)
- `app/rag/retrieve.py` — embeds the user's question, does a pgvector cosine-similarity search, optionally scoped to a `policy_id`
- `app/routers/chat.py::generate_assistant_reply()` — the seam: retrieves context, builds the prompt, calls Ollama, returns `(reply, sources)`

To add more brochures later: add an entry to `data/brochures/manifest.json`,
drop the PDF in `data/brochures/`, run `python -m app.rag.ingest`.

To change models: edit `ollama_chat_model` / `ollama_embed_model` in `.env`
or `app/config.py`. If you change the embedding model to one with a
different vector size, update `EMBEDDING_DIM` in
`alembic/versions/0002_add_document_chunks.py` (new migration) and
`embedding_dim` in `app/config.py` to match, and re-ingest everything.

If Ollama isn't running or a brochure hasn't been ingested yet, `/chat/send`
returns a clear explanatory message instead of crashing — check your
server logs / the reply text if answers seem generic.

## Notes
- Schema is managed **exclusively by Alembic** — there is no `create_all()`
  fallback anymore. If you change `app/models.py`, generate a migration
  (`alembic revision --autogenerate -m "..."`, then review it) and run
  `alembic upgrade head` before restarting the app or running any seed
  script. Seed scripts will refuse to run (with a clear error) if the DB
  isn't at the current migration head — see `_ensure_migrations_applied()`
  in `app/seed_data.py`.
- CORS is wide open (`allow_origins=["*"]`) — restrict to your frontend's
  origin before deploying.
