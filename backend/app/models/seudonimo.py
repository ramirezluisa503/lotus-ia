import uuid

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Seudonimo(Base):
    """Única tabla que une la identidad (auth.usuarios) con los datos del
    proceso vocacional (app.estudiantes). Solo la usa el módulo de
    autenticación/consentimiento."""

    __tablename__ = "seudonimos"
    __table_args__ = {"schema": "auth"}

    usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("auth.usuarios.id"), primary_key=True
    )
    estudiante_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("app.estudiantes.id"), nullable=False, unique=True
    )
