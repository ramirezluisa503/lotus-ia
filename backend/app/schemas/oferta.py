from datetime import date

from pydantic import BaseModel


class AreaConocimientoResponse(BaseModel):
    id: int
    nombre: str


class CarreraResponse(BaseModel):
    id: int
    institucion: str
    nombre: str
    nivel_formacion: str
    modalidad: str
    duracion_semestres: int | None
    costo_semestre: float | None
    sitio_web: str | None


class BecaResponse(BaseModel):
    id: int
    nombre: str
    entidad: str
    descripcion: str | None
    cobertura: str | None
    estrato_maximo: int | None
    url: str | None
    fecha_cierre: date | None
