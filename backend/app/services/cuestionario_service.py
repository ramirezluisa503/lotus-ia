import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import AreaAcademicaInvalidaError, InstrumentoNoDisponibleError
from app.models.datos_socioeconomicos import DatosSocioeconomicos
from app.repositories.cuestionario_repository import CuestionarioRepository
from app.schemas.cuestionario import (
    DatosAcademicosRequest,
    DatosSociodemograficosRequest,
    DatosSocioeconomicosRequest,
    DimensionPuntaje,
    EstadoProcesoResponse,
    InstrumentoActivoResponse,
    MisRespuestasResponse,
    NotaArea,
    PerfilPsicometricoResponse,
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
        estudiante.es_puntaje_simulacro = datos.es_simulacro
        self.db.commit()
        return estudiante.estado_proceso

    def obtener_mi_estado(self, estudiante_id: uuid.UUID) -> EstadoProcesoResponse:
        estudiante = self.repo.obtener_estudiante(estudiante_id)
        return EstadoProcesoResponse(estado_proceso=estudiante.estado_proceso, grado=estudiante.grado)

    def obtener_mis_respuestas(self, estudiante_id: uuid.UUID) -> MisRespuestasResponse:
        estudiante = self.repo.obtener_estudiante(estudiante_id)
        notas = self.repo.notas_por_area(estudiante_id)
        socio = self.repo.obtener_datos_socioeconomicos(estudiante_id)

        return MisRespuestasResponse(
            notas=[NotaArea(area=area, nota=nota) for area, nota in notas.items()],
            puntaje_global_icfes=estudiante.puntaje_global_icfes,
            desempeno_ingles=estudiante.desempeno_ingles,
            es_simulacro=estudiante.es_puntaje_simulacro,
            edad=estudiante.edad,
            genero=estudiante.genero,
            zona=estudiante.zona,
            tipo_institucion=estudiante.tipo_institucion,
            cole_caracter=estudiante.cole_caracter,
            cole_jornada=estudiante.cole_jornada,
            estrato=socio.estrato if socio else None,
            rango_ingresos=socio.rango_ingresos if socio else None,
            personas_hogar=socio.personas_hogar if socio else None,
            educacion_madre=socio.educacion_madre if socio else None,
            educacion_padre=socio.educacion_padre if socio else None,
            ocupacion_hogar=socio.ocupacion_hogar if socio else None,
            tiene_internet=socio.tiene_internet if socio else None,
            tiene_computador=socio.tiene_computador if socio else None,
            tiene_lavadora=socio.tiene_lavadora if socio else None,
            tiene_automovil=socio.tiene_automovil if socio else None,
            recibe_apoyo_estatal=socio.recibe_apoyo_estatal if socio else None,
            trabaja=socio.trabaja if socio else None,
        )

    def obtener_perfil_psicometrico(self, estudiante_id: uuid.UUID) -> PerfilPsicometricoResponse:
        promedios = self.repo.promedio_por_dimension(estudiante_id)
        if not promedios:
            return PerfilPsicometricoResponse(dimensiones=[])

        maximo = max(promedio for _, promedio in promedios)
        dimensiones = [
            DimensionPuntaje(dimension=dimension, promedio=round(promedio, 2), es_dominante=promedio == maximo)
            for dimension, promedio in sorted(promedios, key=lambda d: d[1], reverse=True)
        ]
        return PerfilPsicometricoResponse(dimensiones=dimensiones)

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
