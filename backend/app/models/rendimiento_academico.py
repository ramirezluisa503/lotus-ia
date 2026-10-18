import uuid

from sqlalchemy import ForeignKey, Numeric, SmallInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class RendimientoAcademico(Base):
    __tablename__ = "rendimiento_academico"
    __table_args__ = {"schema": "app"}

    estudiante_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("app.estudiantes.id"), primary_key=True
    )
    area_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("app.areas_academicas.id"), primary_key=True
    )
    nota: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)  # puntaje ICFES 0-100
