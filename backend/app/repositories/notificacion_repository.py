import uuid

from sqlalchemy.orm import Session

from app.models.notificacion import Notificacion


class NotificacionRepository:
    def __init__(self, db: Session):
        self.db = db

    def crear(
        self, usuario_id: uuid.UUID, tipo: str, mensaje: str, enlace: str | None = None
    ) -> Notificacion:
        notificacion = Notificacion(usuario_id=usuario_id, tipo=tipo, mensaje=mensaje, enlace=enlace)
        self.db.add(notificacion)
        return notificacion

    def listar_por_usuario(self, usuario_id: uuid.UUID, limite: int = 30) -> list[Notificacion]:
        return (
            self.db.query(Notificacion)
            .filter(Notificacion.usuario_id == usuario_id)
            .order_by(Notificacion.creada_en.desc())
            .limit(limite)
            .all()
        )

    def obtener(self, notificacion_id: int, usuario_id: uuid.UUID) -> Notificacion | None:
        return (
            self.db.query(Notificacion)
            .filter(Notificacion.id == notificacion_id, Notificacion.usuario_id == usuario_id)
            .first()
        )

    def marcar_todas_leidas(self, usuario_id: uuid.UUID) -> None:
        (
            self.db.query(Notificacion)
            .filter(Notificacion.usuario_id == usuario_id, Notificacion.leida.is_(False))
            .update({Notificacion.leida: True})
        )
