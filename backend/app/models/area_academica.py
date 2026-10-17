from sqlalchemy import SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AreaAcademica(Base):
    __tablename__ = "areas_academicas"
    __table_args__ = {"schema": "app"}

    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
