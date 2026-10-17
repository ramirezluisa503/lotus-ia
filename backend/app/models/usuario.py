import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, LargeBinary, SmallInteger, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.rol import Rol


class Usuario(Base):
    __tablename__ = "usuarios"
    __table_args__ = {"schema": "auth"}

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    correo: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    contrasena_hash: Mapped[str] = mapped_column(String(60), nullable=False)
    nombre_cifrado: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    documento_cifrado: Mapped[bytes | None] = mapped_column(LargeBinary, nullable=True)
    rol_id: Mapped[int] = mapped_column(SmallInteger, ForeignKey("auth.roles.id"), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    intentos_fallidos: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ultimo_acceso: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    rol: Mapped[Rol] = relationship(Rol, lazy="joined")
