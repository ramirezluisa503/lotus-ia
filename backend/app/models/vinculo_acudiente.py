import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class VinculoAcudiente(Base):
    __tablename__ = "vinculos_acudiente"
    __table_args__ = {"schema": "auth"}

    acudiente_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("auth.usuarios.id"), primary_key=True
    )
    estudiante_usuario_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("auth.usuarios.id"), primary_key=True
    )
    parentesco: Mapped[str] = mapped_column(String(12), nullable=False)
