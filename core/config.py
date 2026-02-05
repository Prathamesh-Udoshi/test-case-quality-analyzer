import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "your-default-key-here")
    API_URL: str = os.getenv("API_URL", "http://localhost:8001")
    PORT: int = int(os.getenv("PORT", 8001))

    class Config:
        env_file = ".env"

settings = Settings()
