from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, policies, calculator, applications, notifications, favourites, chat

# Schema is managed exclusively by Alembic now (see alembic/versions/).
# Run `alembic upgrade head` before starting the app or any seed script.
# Do NOT add Base.metadata.create_all() back here — it silently no-ops on
# existing tables and will NOT add new columns, which is exactly the bug
# that caused the benefit-formula columns to go missing. Every schema
# change must be its own Alembic revision.

app = FastAPI(
    title="PolicyWise API",
    description="Backend for the PolicyWise insurance platform (policies, premium calculator, "
                "applications, notifications, and an assistant chat).",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your frontend origin(s) in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(policies.router)
app.include_router(calculator.router)
app.include_router(applications.router)
app.include_router(notifications.router)
app.include_router(favourites.router)
app.include_router(chat.router)


@app.get("/health")
def health():
    return {"status": "ok"}
