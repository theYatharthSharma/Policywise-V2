"""add document_chunks table for RAG (pgvector)

Revision ID: 0002_add_document_chunks
Revises: 0001_add_benefit_formula
Create Date: 2026-09-15

Adds the pgvector extension and the document_chunks table used by the
Ollama-based RAG assistant (app/rag/*). Purely additive.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

revision: str = "0002_add_document_chunks"
down_revision: Union[str, None] = "0001_add_benefit_formula"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

EMBEDDING_DIM = 768  # matches nomic-embed-text; change here + models.py together if you swap embed models


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "document_chunks",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("policy_id", sa.String(), sa.ForeignKey("policies.id"), nullable=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("source_url", sa.String(), nullable=True),
        sa.Column("chunk_index", sa.Integer(), nullable=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("embedding", Vector(EMBEDDING_DIM), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    # ivfflat speeds up cosine-distance search once you have a non-trivial
    # number of chunks; harmless (just unused) on small datasets.
    op.execute(
        "CREATE INDEX ix_document_chunks_embedding ON document_chunks "
        "USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
    )


def downgrade() -> None:
    op.drop_index("ix_document_chunks_embedding", table_name="document_chunks")
    op.drop_table("document_chunks")
    # Not dropping the extension — other things may depend on it by now.
