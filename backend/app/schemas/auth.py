import uuid
from datetime import date
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, model_validator

RolRegistrable = Literal["ESTUDIANTE", "ACUDIENTE"]
Parentesco = Literal["MADRE", "PADRE", "TUTOR_LEGAL"]

EDAD_MINIMA_ACUDIENTE = 18


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
    fecha_nacimiento: date | None = None
    acepta_declaracion_legal: bool = False

    @model_validator(mode="after")
    def _validar_campos_segun_rol(self):
        if not self.documento or not self.documento.strip():
            raise ValueError("Debes indicar tu número de documento de identidad.")

        if self.rol == "ESTUDIANTE" and self.grado is None:
            raise ValueError("Debes indicar tu grado (10° u 11°).")

        if self.rol == "ACUDIENTE":
            if self.correo_estudiante is None:
                raise ValueError("Debes indicar el correo del estudiante al que vas a autorizar.")
            if self.parentesco is None:
                raise ValueError("Debes indicar tu parentesco con el estudiante.")
            if self.fecha_nacimiento is None:
                raise ValueError("Debes indicar tu fecha de nacimiento.")
            elif self._edad(self.fecha_nacimiento) < EDAD_MINIMA_ACUDIENTE:
                raise ValueError("Debes ser mayor de edad para registrarte como acudiente.")
            if not self.acepta_declaracion_legal:
                raise ValueError(
                    "Debes aceptar la declaración de responsabilidad legal para registrarte como acudiente."
                )
        return self

    @staticmethod
    def _edad(fecha_nacimiento: date) -> int:
        hoy = date.today()
        cumplio_este_anio = (hoy.month, hoy.day) >= (fecha_nacimiento.month, fecha_nacimiento.day)
        return hoy.year - fecha_nacimiento.year - (0 if cumplio_este_anio else 1)


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


class VincularEstudianteRequest(BaseModel):
    correo_estudiante: EmailStr
    parentesco: Parentesco


class OlvideContrasenaRequest(BaseModel):
    correo: EmailStr


class RestablecerContrasenaRequest(BaseModel):
    token: str
    nueva_contrasena: str = Field(min_length=8, max_length=72)


class MensajeResponse(BaseModel):
    mensaje: str
