"""
Small wrapper around the local Ollama HTTP API.
Assumes `ollama serve` is running (default http://localhost:11434) and
the models in app.config.settings (ollama_embed_model / ollama_chat_model)
have been pulled, e.g.:

    ollama pull nomic-embed-text
    ollama pull llama3.1:8b
"""
import requests

from app.config import settings


class OllamaError(RuntimeError):
    pass


def embed(text: str) -> list[float]:
    try:
        resp = requests.post(
            f"{settings.ollama_base_url}/api/embeddings",
            json={"model": settings.ollama_embed_model, "prompt": text},
            timeout=60,
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        raise OllamaError(
            f"Could not reach Ollama at {settings.ollama_base_url}. "
            f"Is `ollama serve` running and is '{settings.ollama_embed_model}' pulled? ({e})"
        ) from e
    data = resp.json()
    embedding = data.get("embedding")
    if not embedding:
        raise OllamaError(f"Ollama returned no embedding: {data}")
    return embedding


def chat(messages: list[dict], stream: bool = False) -> str:
    """messages: [{"role": "system"|"user"|"assistant", "content": str}, ...]"""
    try:
        resp = requests.post(
            f"{settings.ollama_base_url}/api/chat",
            json={"model": settings.ollama_chat_model, "messages": messages, "stream": stream},
            timeout=120,
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        raise OllamaError(
            f"Could not reach Ollama at {settings.ollama_base_url}. "
            f"Is `ollama serve` running and is '{settings.ollama_chat_model}' pulled? ({e})"
        ) from e
    data = resp.json()
    message = data.get("message", {})
    content = message.get("content")
    if not content:
        raise OllamaError(f"Ollama returned no content: {data}")
    return content
