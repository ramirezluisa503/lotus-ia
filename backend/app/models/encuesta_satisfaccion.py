from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, SmallInteger, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EncuestaSatisfaccion(Base):
    __tablename__ = "encuestas_satisfaccion"
    __table_args__ = {"schema": "app"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    recomendacion_id: Mapped[int] = mapped_column(
        ForeignKey("app.recomendaciones.id"), unique=True, nullable=False
    )
    calificacion: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    comentario: Mapped[str | None] = mapped_column(String(500), nullable=True)
    respondida_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
