from datetime import datetime

from sqlalchemy import Boolean, DateTime, Numeric, SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ModeloMl(Base):
    __tablename__ = "modelos_ml"
    __table_args__ = {"schema": "app"}

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    version: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    algoritmo: Mapped[str] = mapped_column(String(40), nullable=False)
    ruta_archivo: Mapped[str] = mapped_column(String(200), nullable=False)
    exactitud: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    precision_macro: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    recall_macro: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    f1_macro: Mapped[float | None] = mapped_column(Numeric(5, 4), nullable=True)
    entrenado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
