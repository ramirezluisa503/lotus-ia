from datetime import datetime

from pydantic import BaseModel


class ConsentimientoRequest(BaseModel):
    aceptado: bool


class ConsentimientoResponse(BaseModel):
    tipo: str
    aceptado: bool
    fecha: datetime


class EstadoConsentimientoResponse(BaseModel):
    consentimiento_otorgado: bool
    asentimiento_otorgado: bool
    puede_continuar: bool
