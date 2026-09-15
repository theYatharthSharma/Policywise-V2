from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db
from app.rag.ollama_client import chat as ollama_chat, OllamaError
from app.rag.retrieve import retrieve

router = APIRouter(prefix="/chat", tags=["chat"])

SYSTEM_PROMPT = (
    "You are the PolicyWise assistant, a helpful guide for LIC insurance policies. "
    "Answer ONLY using the CONTEXT provided below, which is extracted from real LIC "
    "brochures. If the context doesn't contain the answer, say you don't have that "
    "detail rather than guessing — never invent premium amounts, ages, or terms. "
    "Keep answers concise and in plain language a first-time buyer would understand."
)

MAX_HISTORY_TURNS = 6  # last N messages included as conversation context


def _build_context_block(chunks: list[models.DocumentChunk]) -> str:
    if not chunks:
        return "(No matching brochure content was found for this question.)"
    parts = []
    for c in chunks:
        parts.append(f"[Source: {c.title}]\n{c.content}")
    return "\n\n---\n\n".join(parts)


def generate_assistant_reply(
    message: str, history: list[models.ChatMessage], db: Session, policy_id: str | None = None
) -> tuple[str, list[dict]]:
    """
    Single seam for the chatbot's "brain". Retrieves relevant brochure
    chunks (RAG) via pgvector cosine similarity, then asks the local
    Ollama model to answer grounded in that context.

    Falls back to a clear, non-crashing error message if Ollama isn't
    reachable or no brochures have been ingested yet, rather than 500ing
    the whole request.
    """
    try:
        chunks = retrieve(db, message, policy_id=policy_id)
    except OllamaError as e:
        return (
            f"I can't reach the local LLM right now ({e}). "
            "Make sure `ollama serve` is running and the embedding model is pulled.",
            [],
        )

    context_block = _build_context_block(chunks)

    messages = [{"role": "system", "content": f"{SYSTEM_PROMPT}\n\nCONTEXT:\n{context_block}"}]
    for h in history[-MAX_HISTORY_TURNS:]:
        messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": message})

    try:
        reply_text = ollama_chat(messages)
    except OllamaError as e:
        return (
            f"I can't reach the local LLM right now ({e}). "
            "Make sure `ollama serve` is running and the chat model is pulled.",
            [],
        )

    sources = [{"title": c.title, "url": c.source_url} for c in chunks]
    return reply_text, sources


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
    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    history = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == current_user.id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )

    user_msg = models.ChatMessage(user_id=current_user.id, role="user", content=payload.message)
    db.add(user_msg)
    db.flush()

    policy_id = getattr(payload, "policy_id", None)
    reply_text, sources = generate_assistant_reply(payload.message, history, db, policy_id=policy_id)

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
