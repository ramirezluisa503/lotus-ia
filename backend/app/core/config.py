from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+psycopg://lotusia:lotusia_dev@localhost:5432/lotusia"
    jwt_secret: str = "dev-secret-cambia-esto"
    jwt_expire_minutes: int = 60
    fernet_key: str = ""
    cors_origin: str = "http://localhost:5173"
    frontend_url: str = "http://localhost:5173"

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    email_from: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
