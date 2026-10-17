from datetime import datetime

from pydantic import BaseModel

AVISO_ORIENTATIVO = (
    "Esta recomendación es orientativa y no reemplaza el acompañamiento del "
    "orientador escolar."
)


class RecomendacionResponse(BaseModel):
    id: int
    area: str
    nivel_formacion: str
    probabilidad: float | None
    explicacion: str
    generada_en: datetime
    ya_calificada: bool
    aviso: str = AVISO_ORIENTATIVO
