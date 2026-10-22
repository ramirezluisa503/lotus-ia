import uuid
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator

RolRegistrable = Literal["ESTUDIANTE", "ACUDIENTE"]
Parentesco = Literal["MADRE", "PADRE", "TUTOR_LEGAL"]


class RegistroRequest(BaseModel):
    nombre: str = Field(min_length=2, max_length=150)
    correo: EmailStr
    contrasena: str = Field(min_length=8, max_length=72)
    rol: RolRegistrable
    documento: str | None = Field(default=None, max_length=30)

    # Solo si rol == ESTUDIANTE
    grado: Literal[10, 11] | None = None

    # Solo si rol == ACUDIENTE
    correo_estudiante: EmailStr | None = None
    parentesco: Parentesco | None = None

    @model_validator(mode="after")
    def _validar_campos_segun_rol(self):
        if self.rol == "ESTUDIANTE" and self.grado is None:
            raise ValueError("Debes indicar tu grado (10° u 11°).")
        if self.rol == "ACUDIENTE":
            if self.correo_estudiante is None:
                raise ValueError("Debes indicar el correo del estudiante al que vas a autorizar.")
            if self.parentesco is None:
                raise ValueError("Debes indicar tu parentesco con el estudiante.")
        return self


class RegistroResponse(BaseModel):
    id: uuid.UUID
    correo: EmailStr
    rol: str


class LoginRequest(BaseModel):
    correo: EmailStr
    contrasena: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    rol: str
    usuario_id: uuid.UUID


class UsuarioActual(BaseModel):
    id: uuid.UUID
    correo: EmailStr
    rol: str


class OlvideContrasenaRequest(BaseModel):
    correo: EmailStr


class RestablecerContrasenaRequest(BaseModel):
    token: str
    nueva_contrasena: str = Field(min_length=8, max_length=72)


class MensajeResponse(BaseModel):
    mensaje: str
