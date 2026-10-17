from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

Caracter = Literal[
    "UNIVERSIDAD", "INSTITUCION_UNIVERSITARIA", "INSTITUCION_TECNOLOGICA", "INSTITUCION_TECNICA_PROFESIONAL"
]
Sector = Literal["OFICIAL", "PRIVADO"]
NivelFormacion = Literal["TECNICO_PROFESIONAL", "TECNOLOGICO", "UNIVERSITARIO"]
Modalidad = Literal["PRESENCIAL", "VIRTUAL", "DISTANCIA", "HIBRIDA"]


# ---------- Instituciones ----------

class InstitucionRequest(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    caracter: Caracter
    sector: Sector
    sitio_web: str | None = Field(default=None, max_length=200)
    direccion: str | None = Field(default=None, max_length=150)


class InstitucionResponse(InstitucionRequest):
    id: int


# ---------- Carreras ----------

class CarreraRequest(BaseModel):
    institucion_id: int
    area: str
    nombre: str = Field(min_length=2, max_length=150)
    nivel_formacion: NivelFormacion
    modalidad: Modalidad
    duracion_semestres: int | None = Field(default=None, ge=1, le=14)
    costo_semestre: float | None = Field(default=None, ge=0)
    vigente: bool = True


class CarreraAdminResponse(BaseModel):
    id: int
    institucion_id: int
    institucion: str
    area: str
    nombre: str
    nivel_formacion: str
    modalidad: str
    duracion_semestres: int | None
    costo_semestre: float | None
    vigente: bool
    actualizado_en: datetime


# ---------- Becas ----------

class BecaRequest(BaseModel):
    institucion_id: int | None = None
    nombre: str = Field(min_length=2, max_length=150)
    entidad: str = Field(min_length=2, max_length=120)
    descripcion: str | None = None
    cobertura: str | None = Field(default=None, max_length=80)
    estrato_maximo: int | None = Field(default=None, ge=1, le=6)
    url: str | None = Field(default=None, max_length=250)
    fecha_cierre: date | None = None
    vigente: bool = True
    areas: list[str] = Field(default_factory=list)


class BecaAdminResponse(BaseModel):
    id: int
    institucion_id: int | None
    nombre: str
    entidad: str
    descripcion: str | None
    cobertura: str | None
    estrato_maximo: int | None
    url: str | None
    fecha_cierre: date | None
    vigente: bool
    areas: list[str]
    actualizado_en: datetime


# ---------- Modelos de IA ----------

class ModeloMlResponse(BaseModel):
    id: int
    version: str
    algoritmo: str
    exactitud: float | None
    precision_macro: float | None
    recall_macro: float | None
    f1_macro: float | None
    entrenado_en: datetime
    activo: bool
