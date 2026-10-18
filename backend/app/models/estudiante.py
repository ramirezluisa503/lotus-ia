import uuid
from datetime import datetime

from sqlalchemy import DateTime, SmallInteger, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Estudiante(Base):
    __tablename__ = "estudiantes"
    __table_args__ = {"schema": "app"}

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    grado: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    edad: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    genero: Mapped[str | None] = mapped_column(String(17), nullable=True)
    zona: Mapped[str | None] = mapped_column(String(6), nullable=True)
    tipo_institucion: Mapped[str | None] = mapped_column(String(7), nullable=True)
    cole_caracter: Mapped[str | None] = mapped_column(String(20), nullable=True)
    cole_jornada: Mapped[str | None] = mapped_column(String(10), nullable=True)
    puntaje_global_icfes: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    desempeno_ingles: Mapped[str | None] = mapped_column(String(2), nullable=True)
    estado_proceso: Mapped[str] = mapped_column(String(15), nullable=False, default="REGISTRADO")
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
