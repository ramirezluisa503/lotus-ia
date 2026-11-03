import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class ConsentimientoRequest(BaseModel):
    aceptado: bool


class ConsentimientoAcudienteRequest(BaseModel):
    estudiante_usuario_id: uuid.UUID
    aceptado: bool


class ConsentimientoResponse(BaseModel):
    tipo: str
    aceptado: bool
    fecha: datetime


class EstadoConsentimientoResponse(BaseModel):
    consentimiento_otorgado: bool
    asentimiento_otorgado: bool
    puede_continuar: bool


class EstudianteVinculadoResponse(BaseModel):
    estudiante_usuario_id: uuid.UUID
    nombre: str
    documento: str
    correo: EmailStr
    parentesco: str
    consentimiento_otorgado: bool
    asentimiento_otorgado: bool
    puede_continuar: bool
