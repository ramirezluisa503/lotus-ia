from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

settings = get_settings()

# Los modelos usan el esquema "auth"; schema_translate_map lo redirige a
# esquema_identidad (p. ej. "identidad" en Supabase) sin tocar los modelos.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    execution_options={"schema_translate_map": {"auth": settings.esquema_identidad}},
)
SessionLocal = sessionmaker(bind=engine, autoflush=True, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
