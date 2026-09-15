def chunk_text(text: str, chunk_size_words: int = 220, overlap_words: int = 40) -> list[str]:
    """
    Simple sliding-window word chunker. Good enough for brochure-style text
    (short paragraphs, bullet points, tables-as-text). If you outgrow this,
    swap in a proper sentence/markdown-aware splitter.
    """
    words = text.split()
    if not words:
        return []

    chunks = []
    start = 0
    step = max(1, chunk_size_words - overlap_words)
    while start < len(words):
        chunk = " ".join(words[start : start + chunk_size_words])
        if chunk.strip():
            chunks.append(chunk.strip())
        start += step
    return chunks
