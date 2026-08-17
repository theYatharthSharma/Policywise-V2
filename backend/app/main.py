from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, policies, calculator, applications, notifications, favourites, chat

# For production, prefer Alembic migrations over create_all.
Base.metadata.create_all(bind=engine)

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
