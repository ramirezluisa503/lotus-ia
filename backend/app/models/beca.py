from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, SmallInteger, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Beca(Base):
    __tablename__ = "becas"
    __table_args__ = {"schema": "app"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    institucion_id: Mapped[int | None] = mapped_column(
        ForeignKey("app.instituciones.id"), nullable=True
    )
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    entidad: Mapped[str] = mapped_column(String(120), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text, nullable=True)
    cobertura: Mapped[str | None] = mapped_column(String(80), nullable=True)
    estrato_maximo: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    url: Mapped[str | None] = mapped_column(String(250), nullable=True)
    fecha_cierre: Mapped[date | None] = mapped_column(Date, nullable=True)
    vigente: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    actualizado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class BecaArea(Base):
    __tablename__ = "becas_areas"
    __table_args__ = {"schema": "app"}

    beca_id: Mapped[int] = mapped_column(ForeignKey("app.becas.id"), primary_key=True)
    area_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("app.areas_conocimiento.id"), primary_key=True
    )
