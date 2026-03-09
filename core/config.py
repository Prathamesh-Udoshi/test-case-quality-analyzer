from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    OPENAI_API_KEY: str = Field(default="your-default-key-here")
    API_URL: str = Field(default="http://localhost:8001")
    PORT: int = Field(default=8001)

    class Config:
        env_file = ".env"

settings = Settings()