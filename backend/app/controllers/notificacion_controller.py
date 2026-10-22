from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import obtener_usuario_actual
from app.db.session import get_db
from app.schemas.auth import UsuarioActual
from app.schemas.notificacion import ListaNotificacionesResponse
from app.services.notificacion_service import NotificacionService

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])


@router.get("", response_model=ListaNotificacionesResponse)
def listar_notificaciones(
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    return NotificacionService(db).listar(usuario.id)


@router.post("/{notificacion_id}/leer")
def marcar_leida(
    notificacion_id: int,
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    NotificacionService(db).marcar_leida(notificacion_id, usuario.id)
    return {"ok": True}


@router.post("/leer-todas")
def marcar_todas_leidas(
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    NotificacionService(db).marcar_todas_leidas(usuario.id)
    return {"ok": True}
