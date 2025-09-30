from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/goodtoday"
    SECRET: str = "change-me"
    ACCESS_TTL_MIN: int = 30
    REFRESH_TTL_DAYS: int = 30
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173", "http://127.0.0.1:5173",
        "capacitor://localhost", "ionic://localhost",
    ]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()