import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import AreaAcademicaInvalidaError, InstrumentoNoDisponibleError
from app.models.datos_socioeconomicos import DatosSocioeconomicos
from app.repositories.cuestionario_repository import CuestionarioRepository
from app.schemas.cuestionario import (
    DatosAcademicosRequest,
    DatosSociodemograficosRequest,
    DatosSocioeconomicosRequest,
    InstrumentoActivoResponse,
    PreguntaResponse,
    RespuestasPsicometricoRequest,
)


class CuestionarioService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = CuestionarioRepository(db)

    def guardar_academico(self, estudiante_id: uuid.UUID, datos: DatosAcademicosRequest) -> str:
        for item in datos.notas:
            area = self.repo.obtener_area_por_nombre(item.area)
            if area is None:
                raise AreaAcademicaInvalidaError(item.area)
            self.repo.guardar_nota(estudiante_id, area.id, item.nota)

        estudiante = self.repo.obtener_estudiante(estudiante_id)
        estudiante.puntaje_global_icfes = datos.puntaje_global_icfes
        estudiante.desempeno_ingles = datos.desempeno_ingles
        self.db.commit()
        return estudiante.estado_proceso

    def guardar_sociodemografico(
        self, estudiante_id: uuid.UUID, datos: DatosSociodemograficosRequest
    ) -> str:
        estudiante = self.repo.obtener_estudiante(estudiante_id)
        estudiante.edad = datos.edad
        estudiante.genero = datos.genero
        estudiante.zona = datos.zona
        estudiante.tipo_institucion = datos.tipo_institucion
        estudiante.cole_caracter = datos.cole_caracter
        estudiante.cole_jornada = datos.cole_jornada
        self.db.commit()
        return estudiante.estado_proceso

    def guardar_socioeconomico(
        self, estudiante_id: uuid.UUID, datos: DatosSocioeconomicosRequest
    ) -> str:
        registro = DatosSocioeconomicos(estudiante_id=estudiante_id, **datos.model_dump())
        self.repo.guardar_datos_socioeconomicos(registro)
        self.db.commit()
        return self.repo.obtener_estudiante(estudiante_id).estado_proceso

    def obtener_instrumento_activo(self) -> InstrumentoActivoResponse:
        instrumento = self.repo.obtener_instrumento_activo()
        if instrumento is None:
            raise InstrumentoNoDisponibleError()
        preguntas = self.repo.listar_preguntas(instrumento.id)
        return InstrumentoActivoResponse(
            id=instrumento.id,
            nombre=instrumento.nombre,
            version=instrumento.version,
            preguntas=[
                PreguntaResponse(id=p.id, dimension=p.dimension, enunciado=p.enunciado, orden=p.orden)
                for p in preguntas
            ],
        )

    def guardar_psicometrico(
        self, estudiante_id: uuid.UUID, datos: RespuestasPsicometricoRequest
    ) -> str:
        instrumento = self.repo.obtener_instrumento_activo()
        if instrumento is None:
            raise InstrumentoNoDisponibleError()

        for item in datos.respuestas:
            self.repo.guardar_respuesta(estudiante_id, item.pregunta_id, item.valor)

        estudiante = self.repo.obtener_estudiante(estudiante_id)
        total_preguntas = len(self.repo.listar_preguntas(instrumento.id))
        respondidas = self.repo.contar_respuestas(estudiante_id, instrumento.id)
        if respondidas >= total_preguntas:
            estudiante.estado_proceso = "DATOS_COMPLETOS"

        self.db.commit()
        return estudiante.estado_proceso
