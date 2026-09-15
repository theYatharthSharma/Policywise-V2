from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://policywise_user:policywise_pass@localhost:5432/policywise"

    jwt_secret_key: str = "change-this-to-a-long-random-string"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440

    llm_provider: str = "anthropic"
    llm_api_key: str = ""
    llm_model: str = "claude-sonnet-4-6"

    # Ollama (local LLM used for the PolicyWise assistant)
    ollama_base_url: str = "http://localhost:11434"
    ollama_chat_model: str = "llama3.1:8b"        # generation model
    ollama_embed_model: str = "nomic-embed-text"  # embedding model, 768-dim
    embedding_dim: int = 768
    rag_top_k: int = 4

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
