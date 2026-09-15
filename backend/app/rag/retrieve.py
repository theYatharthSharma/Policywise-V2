from sqlalchemy.orm import Session

from app.config import settings
from app.models import DocumentChunk
from app.rag.ollama_client import embed


def retrieve(db: Session, query: str, policy_id: str | None = None, k: int | None = None) -> list[DocumentChunk]:
    """
    Returns the top-k most relevant document chunks for `query`, using
    pgvector cosine distance. If `policy_id` is given, restricts the search
    to chunks tagged with that policy (falls back to searching everything
    if that policy has no ingested brochure yet).
    """
    k = k or settings.rag_top_k
    query_vector = embed(query)

    base_query = db.query(DocumentChunk)
    if policy_id:
        scoped = base_query.filter(DocumentChunk.policy_id == policy_id)
        if scoped.count() > 0:
            base_query = scoped

    return (
        base_query.order_by(DocumentChunk.embedding.cosine_distance(query_vector))
        .limit(k)
        .all()
    )
