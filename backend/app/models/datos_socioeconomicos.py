import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, SmallInteger, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class DatosSocioeconomicos(Base):
    __tablename__ = "datos_socioeconomicos"
    __table_args__ = {"schema": "app"}

    estudiante_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("app.estudiantes.id"), primary_key=True
    )
    estrato: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    rango_ingresos: Mapped[str | None] = mapped_column(String(10), nullable=True)
    personas_hogar: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    educacion_madre: Mapped[str | None] = mapped_column(String(50), nullable=True)
    educacion_padre: Mapped[str | None] = mapped_column(String(50), nullable=True)
    ocupacion_hogar: Mapped[str | None] = mapped_column(String(40), nullable=True)
    tiene_internet: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    tiene_computador: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    tiene_lavadora: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    tiene_automovil: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    recibe_apoyo_estatal: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    trabaja: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    actualizado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
