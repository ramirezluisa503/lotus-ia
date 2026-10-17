import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, SmallInteger, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Respuesta(Base):
    __tablename__ = "respuestas"
    __table_args__ = {"schema": "app"}

    estudiante_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("app.estudiantes.id"), primary_key=True
    )
    pregunta_id: Mapped[int] = mapped_column(
        ForeignKey("app.preguntas.id"), primary_key=True
    )
    valor: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    respondida_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
