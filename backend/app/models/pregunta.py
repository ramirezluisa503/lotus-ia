from sqlalchemy import ForeignKey, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Pregunta(Base):
    __tablename__ = "preguntas"
    __table_args__ = {"schema": "app"}

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    instrumento_id: Mapped[int] = mapped_column(
        SmallInteger, ForeignKey("app.instrumentos.id"), nullable=False
    )
    dimension: Mapped[str] = mapped_column(String(30), nullable=False)
    enunciado: Mapped[str] = mapped_column(Text, nullable=False)
    orden: Mapped[int] = mapped_column(SmallInteger, nullable=False)
