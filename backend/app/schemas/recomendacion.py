from datetime import datetime

from pydantic import BaseModel

AVISO_ORIENTATIVO = (
    "Esta recomendación es orientativa y no reemplaza el acompañamiento del "
    "orientador escolar."
)


class RazonResponse(BaseModel):
    """Una condición del árbol de decisión que pesó en la recomendación."""

    variable: str
    nombre: str
    valor: float | None
    referencia: float | None  # punto de corte que usó el árbol
    direccion: str  # "por_encima" o "por_debajo" de la referencia


class RecomendacionResponse(BaseModel):
    id: int
    area: str
    nivel_formacion: str
    probabilidad: float | None
    explicacion: str
    razones: list[RazonResponse] = []
    generada_en: datetime
    ya_calificada: bool
    aviso: str = AVISO_ORIENTATIVO
