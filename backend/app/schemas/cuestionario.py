from typing import Literal

from pydantic import BaseModel, Field

Genero = Literal["FEMENINO", "MASCULINO", "OTRO", "PREFIERE_NO_DECIR"]
Zona = Literal["URBANA", "RURAL"]
TipoInstitucion = Literal["PUBLICA", "PRIVADA"]
RangoIngresos = Literal["<1", "1-2", "2-3", "3-5", ">5"]
ColeCaracter = Literal["ACADEMICO", "TECNICO", "TECNICO_ACADEMICO", "NO_APLICA"]
ColeJornada = Literal["MANANA", "TARDE", "NOCHE", "COMPLETA", "SABATINA", "UNICA"]
DesempenoIngles = Literal["A-", "A1", "A2", "B1", "B+"]

# Nivel educativo que espera el modelo de IA (ver backend/ml/README.md);
# el frontend muestra las etiquetas en español con tilde, esto es lo que
# se guarda y se le manda tal cual al modelo.
NivelEducativo = Literal[
    "Ninguno", "Primaria incompleta", "Primaria completa",
    "Secundaria (Bachillerato) incompleta", "Secundaria (Bachillerato) completa",
    "Técnica o tecnológica incompleta", "Técnica o tecnológica completa",
    "Educación profesional incompleta", "Educación profesional completa",
    "Postgrado", "No sabe",
]


class NotaArea(BaseModel):
    area: str
    nota: float = Field(ge=0, le=100, description="Puntaje ICFES Saber 11 (0-100)")


class DatosAcademicosRequest(BaseModel):
    notas: list[NotaArea]
    puntaje_global_icfes: int = Field(ge=0, le=500)
    desempeno_ingles: DesempenoIngles


class DatosSociodemograficosRequest(BaseModel):
    edad: int = Field(ge=13, le=21)
    genero: Genero | None = None
    zona: Zona
    tipo_institucion: TipoInstitucion
    cole_caracter: ColeCaracter
    cole_jornada: ColeJornada


class DatosSocioeconomicosRequest(BaseModel):
    estrato: int | None = Field(default=None, ge=0, le=6)
    rango_ingresos: RangoIngresos | None = None
    personas_hogar: int | None = Field(default=None, ge=1, le=20)
    educacion_madre: NivelEducativo | None = None
    educacion_padre: NivelEducativo | None = None
    ocupacion_hogar: str | None = None
    tiene_internet: bool | None = None
    tiene_computador: bool | None = None
    tiene_lavadora: bool | None = None
    tiene_automovil: bool | None = None
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
