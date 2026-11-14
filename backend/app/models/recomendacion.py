import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Numeric, SmallInteger, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.area_conocimiento import AreaConocimiento


class Recomendacion(Base):
    __tablename__ = "recomendaciones"
    __table_args__ = {"schema": "app"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    estudiante_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("app.estudiantes.id"), nullable=False
    )
    modelo_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("app.modelos_ml.id"), nullable=False)
    area_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("app.areas_conocimiento.id"), nullable=False
    )
    nivel_formacion: Mapped[str] = mapped_column(String(19), nullable=False)
    probabilidad: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    explicacion: Mapped[str] = mapped_column(Text, nullable=False)
    # Las mismas razones de `explicacion`, pero como lista (para mostrarlas
    # como tarjetas). Puede ser NULL en recomendaciones generadas antes.
    razones: Mapped[list | None] = mapped_column(JSONB, nullable=True)
    generada_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    area: Mapped[AreaConocimiento] = relationship(AreaConocimiento, lazy="joined")
