"""
Ingests LIC brochure PDFs into the `document_chunks` table for RAG.

Requires the document_chunks table to already exist — run
`alembic upgrade head` first (see alembic/versions/0002_add_document_chunks.py).

Usage:
    python -m app.rag.ingest                     # ingest everything in the manifest
    python -m app.rag.ingest --policy tech-term   # ingest just one policy's brochure(s)

Expects data/brochures/manifest.json, e.g.:
[
  {"policy_id": "tech-term", "title": "LIC Tech Term Sales Brochure", "file": "tech-term.pdf",
   "source_url": "https://licindia.in/.../Tech-Term-Brochure.pdf"}
]

Run scripts/download_brochures.py first to fetch the PDFs listed in the
manifest into data/brochures/, or drop your own PDFs there and point
"file" at them.
"""
import argparse
import json
from pathlib import Path

from pypdf import PdfReader

from app.database import SessionLocal
from app.models import DocumentChunk
from app.rag.chunking import chunk_text
from app.rag.ollama_client import embed
from app.seed_data import _ensure_migrations_applied

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
BROCHURE_DIR = BACKEND_DIR / "data" / "brochures"
MANIFEST_PATH = BROCHURE_DIR / "manifest.json"


def extract_pdf_text(path: Path) -> str:
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def ingest_document(db, policy_id: str | None, title: str, path: Path, source_url: str | None = None):
    if not path.exists():
        print(f"  ! Skipping '{title}': file not found at {path}. Run scripts/download_brochures.py first?")
        return 0

    text = extract_pdf_text(path)
    chunks = chunk_text(text)
    if not chunks:
        print(f"  ! No extractable text in {path.name} (scanned/image PDF? try OCR first)")
        return 0

    # Replace any previous chunks for this exact title so re-running is idempotent
    db.query(DocumentChunk).filter(DocumentChunk.title == title).delete()

    for i, chunk in enumerate(chunks):
        vector = embed(chunk)
        db.add(DocumentChunk(
            policy_id=policy_id,
            title=title,
            source_url=source_url,
            chunk_index=i,
            content=chunk,
            embedding=vector,
        ))
    db.commit()
    print(f"  + Ingested '{title}': {len(chunks)} chunks")
    return len(chunks)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--policy", help="Only ingest this policy_id", default=None)
    args = parser.parse_args()

    _ensure_migrations_applied()

    if not MANIFEST_PATH.exists():
        print(f"No manifest found at {MANIFEST_PATH}. See app/rag/ingest.py docstring for the format.")
        return

    manifest = json.loads(MANIFEST_PATH.read_text())
    db = SessionLocal()
    total = 0
    try:
        for entry in manifest:
            if args.policy and entry["policy_id"] != args.policy:
                continue
            path = BROCHURE_DIR / entry["file"]
            total += ingest_document(
                db,
                policy_id=entry.get("policy_id"),
                title=entry["title"],
                path=path,
                source_url=entry.get("source_url"),
            )
    finally:
        db.close()
    print(f"Done. {total} chunks ingested.")


if __name__ == "__main__":
    main()
