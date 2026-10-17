import uuid
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

RolRegistrable = Literal["ESTUDIANTE", "ACUDIENTE"]


class RegistroRequest(BaseModel):
    nombre: str = Field(min_length=2, max_length=150)
    correo: EmailStr
    contrasena: str = Field(min_length=8, max_length=72)
    rol: RolRegistrable
    documento: str | None = Field(default=None, max_length=30)


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
