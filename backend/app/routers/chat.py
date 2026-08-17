from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/chat", tags=["chat"])

_CANNED_REPLIES = [
    "Great question. In short: this plan offers guaranteed savings and lifelong protection — "
    "a good fit for long-term goals like retirement or family security.",
    "You'd typically want to weigh premium affordability, sum assured, and term length against "
    "your future goals. Would you like me to compare two specific plans?",
    "For a 30-year-old, a term plan usually provides the highest cover at the lowest cost — "
    "pair it with an endowment plan for savings.",
    "'Sum Assured' is the guaranteed amount your nominee receives on the insured event — "
    "separate from bonuses or maturity additions.",
]


def generate_assistant_reply(message: str, history: list[models.ChatMessage], db: Session) -> tuple[str, list[dict]]:
    """
    Single seam for the chatbot's "brain". Right now this is a placeholder
    that mirrors the old frontend's canned-reply behavior so the feature
    works end-to-end.

    TO INTEGRATE A REAL LLM LATER:
    - Call your LLM provider here (e.g. Anthropic Messages API) with
      `message` + recent `history` as context, optionally with retrieved
      policy data from the `policies` table (RAG) so answers are grounded
      in real plan details/premium formulas.
    - Return (reply_text, sources) — everything downstream (persistence,
      response schema, frontend contract) stays the same.
    """
    pick = _CANNED_REPLIES[(len(message) + len(history)) % len(_CANNED_REPLIES)]
    sources = [
        {"title": "PolicyWise Policy Guide 2026"},
        {"title": "IRDAI — Understanding Life Insurance"},
    ]
    return pick, sources


@router.get("/history", response_model=list[schemas.ChatMessageOut])
def get_history(
    current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == current_user.id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )


@router.post("/send", response_model=schemas.ChatReply)
def send_message(
    payload: schemas.ChatSend,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    history = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == current_user.id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )

    user_msg = models.ChatMessage(user_id=current_user.id, role="user", content=payload.message)
    db.add(user_msg)
    db.flush()

    reply_text, sources = generate_assistant_reply(payload.message, history, db)

    assistant_msg = models.ChatMessage(
        user_id=current_user.id, role="assistant", content=reply_text, sources=sources
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    full_history = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == current_user.id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )
    return schemas.ChatReply(reply=assistant_msg, history=full_history)
