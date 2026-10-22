import uuid

from sqlalchemy.orm import Session

from app.repositories.notificacion_repository import NotificacionRepository
from app.schemas.notificacion import ListaNotificacionesResponse, NotificacionResponse


def crear_notificacion(
    db: Session, usuario_id: uuid.UUID, tipo: str, mensaje: str, enlace: str | None = None
) -> None:
    """Función de conveniencia para que otros servicios (consentimiento,
    auth, recomendación...) disparen una notificación sin tener que
    instanciar el repositorio ellos mismos. No hace commit -- queda dentro
    de la misma transacción de quien la llama."""
    NotificacionRepository(db).crear(usuario_id, tipo, mensaje, enlace)


class NotificacionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = NotificacionRepository(db)

    def listar(self, usuario_id: uuid.UUID) -> ListaNotificacionesResponse:
        notificaciones = self.repo.listar_por_usuario(usuario_id)
        no_leidas = sum(1 for n in notificaciones if not n.leida)
        return ListaNotificacionesResponse(
            notificaciones=[NotificacionResponse.model_validate(n, from_attributes=True) for n in notificaciones],
            no_leidas=no_leidas,
        )

    def marcar_leida(self, notificacion_id: int, usuario_id: uuid.UUID) -> None:
        notificacion = self.repo.obtener(notificacion_id, usuario_id)
        if notificacion is not None:
            notificacion.leida = True
            self.db.commit()

    def marcar_todas_leidas(self, usuario_id: uuid.UUID) -> None:
        self.repo.marcar_todas_leidas(usuario_id)
        self.db.commit()
