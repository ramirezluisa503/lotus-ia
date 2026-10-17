from datetime import datetime

from pydantic import BaseModel, Field


class EncuestaRequest(BaseModel):
    recomendacion_id: int
    calificacion: int = Field(ge=1, le=5)
    comentario: str | None = Field(default=None, max_length=500)


class EncuestaResponse(BaseModel):
    id: int
    recomendacion_id: int
    calificacion: int
    comentario: str | None
    respondida_en: datetime
