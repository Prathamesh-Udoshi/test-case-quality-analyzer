import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "your-default-key-here")

    class Config:
        env_file = ".env"

settings = Settings()
