from typing import Literal

from pydantic import BaseModel, Field

Genero = Literal["FEMENINO", "MASCULINO", "OTRO", "PREFIERE_NO_DECIR"]
Zona = Literal["URBANA", "RURAL"]
TipoInstitucion = Literal["PUBLICA", "PRIVADA"]
RangoIngresos = Literal["<1", "1-2", "2-3", "3-5", ">5"]


class NotaArea(BaseModel):
    area: str
    nota: float = Field(ge=1.0, le=5.0)


class DatosAcademicosRequest(BaseModel):
    notas: list[NotaArea]


class DatosSociodemograficosRequest(BaseModel):
    edad: int = Field(ge=13, le=21)
    genero: Genero | None = None
    zona: Zona
    tipo_institucion: TipoInstitucion


class DatosSocioeconomicosRequest(BaseModel):
    estrato: int | None = Field(default=None, ge=0, le=6)
    rango_ingresos: RangoIngresos | None = None
    personas_hogar: int | None = Field(default=None, ge=1, le=20)
    educacion_madre: str | None = None
    educacion_padre: str | None = None
    ocupacion_hogar: str | None = None
    tiene_internet: bool | None = None
    tiene_computador: bool | None = None
    recibe_apoyo_estatal: bool | None = None
    trabaja: bool | None = None


class PreguntaResponse(BaseModel):
    id: int
    dimension: str
    enunciado: str
    orden: int


class InstrumentoActivoResponse(BaseModel):
    id: int
    nombre: str
    version: str
    preguntas: list[PreguntaResponse]


class RespuestaItem(BaseModel):
    pregunta_id: int
    valor: int = Field(ge=1, le=5)


class RespuestasPsicometricoRequest(BaseModel):
    respuestas: list[RespuestaItem]


class PasoGuardadoResponse(BaseModel):
    ok: bool = True
    estado_proceso: str
