from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, SmallInteger, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.area_conocimiento import AreaConocimiento
from app.models.institucion import InstitucionEducativa


class Carrera(Base):
    __tablename__ = "carreras"
    __table_args__ = {"schema": "app"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    institucion_id: Mapped[int] = mapped_column(ForeignKey("app.instituciones.id"), nullable=False)
    area_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("app.areas_conocimiento.id"), nullable=False
    )
    codigo_snies: Mapped[int | None] = mapped_column(nullable=True, unique=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    nivel_formacion: Mapped[str] = mapped_column(String(19), nullable=False)
    modalidad: Mapped[str] = mapped_column(String(10), nullable=False)
    duracion_semestres: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    costo_semestre: Mapped[float | None] = mapped_column(Numeric(12, 0), nullable=True)
    vigente: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    actualizado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    institucion: Mapped[InstitucionEducativa] = relationship(InstitucionEducativa, lazy="joined")
    area: Mapped[AreaConocimiento] = relationship(AreaConocimiento, lazy="joined")
