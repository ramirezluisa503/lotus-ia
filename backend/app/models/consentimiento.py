import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Consentimiento(Base):
    __tablename__ = "consentimientos"
    __table_args__ = {"schema": "app"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    estudiante_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("app.estudiantes.id"), nullable=False
    )
    tipo: Mapped[str] = mapped_column(String(14), nullable=False)  # CONSENTIMIENTO | ASENTIMIENTO
    acudiente_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("auth.usuarios.id"), nullable=True
    )
    version_texto: Mapped[str] = mapped_column(String(10), nullable=False)
    aceptado: Mapped[bool] = mapped_column(Boolean, nullable=False)
    fecha: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    revocado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
