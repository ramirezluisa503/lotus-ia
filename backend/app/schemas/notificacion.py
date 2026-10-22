from datetime import datetime

from pydantic import BaseModel


class NotificacionResponse(BaseModel):
    id: int
    tipo: str
    mensaje: str
    enlace: str | None
    leida: bool
    creada_en: datetime


class ListaNotificacionesResponse(BaseModel):
    notificaciones: list[NotificacionResponse]
    no_leidas: int
