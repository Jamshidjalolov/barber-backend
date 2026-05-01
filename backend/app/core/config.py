from __future__ import annotations

from pathlib import Path
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    app_name: str = "Barbershop Backend"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    frontend_url: str = "http://localhost:5173"

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "barbershop"
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    database_url: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/barbershop",
        repr=False,
    )

    jwt_secret_key: str = "change-this-secret"
    jwt_algorithm: str = "HS256"
    jwt_access_token_minutes: int = 120

    telegram_bot_token: str | None = None
    telegram_admin_chat_id: str | None = None
    telegram_api_base: str = "https://api.telegram.org"
    telegram_bot_username: str | None = None
    telegram_poll_timeout_seconds: int = 20
    telegram_poll_retry_seconds: int = 5
    booking_reminder_minutes_before: int = 10
    booking_reminder_check_interval_seconds: int = 30

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: Any) -> Any:
        if not isinstance(value, str):
            return value
        value = value.strip().strip("\"'")
        if value.startswith("DATABASE_URL="):
            value = value.split("=", 1)[1].strip().strip("\"'")
        for prefix in ("postgresql://", "postgres://", "postgresql+asyncpg://"):
            index = value.find(prefix)
            if index > 0:
                value = value[index:].split()[0].strip().strip("\"'")
                break
        if value.startswith("postgres://"):
            value = value.replace("postgres://", "postgresql+asyncpg://", 1)
        elif value.startswith("postgresql://"):
            value = value.replace("postgresql://", "postgresql+asyncpg://", 1)

        parts = urlsplit(value)
        if parts.scheme != "postgresql+asyncpg" or not parts.netloc or not parts.path.strip("/"):
            raise ValueError(
                "DATABASE_URL must be the Render PostgreSQL Internal Database URL, "
                "for example postgresql://user:password@host:5432/database. "
                "Do not paste the psql command or the DATABASE_URL= prefix."
            )
        query = dict(parse_qsl(parts.query, keep_blank_values=True))
        sslmode = query.pop("sslmode", None)
        if sslmode and "ssl" not in query:
            query["ssl"] = sslmode

        return urlunsplit(parts._replace(query=urlencode(query)))

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
        extra="ignore",
        hide_input_in_errors=True,
    )


settings = Settings()
