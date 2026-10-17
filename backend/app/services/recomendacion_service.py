import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import DatosInsuficientesError, ModeloNoDisponibleError
from app.ia import modelo as capa_ia
from app.models.recomendacion import Recomendacion
from app.repositories.estudiante_repository import EstudianteRepository
from app.repositories.oferta_repository import OfertaRepository
from app.repositories.recomendacion_repository import RecomendacionRepository
from app.schemas.recomendacion import RecomendacionResponse


class RecomendacionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = RecomendacionRepository(db)
        self.ofertas = OfertaRepository(db)
        self.estudiantes = EstudianteRepository(db)

    def _a_response(self, r: Recomendacion) -> RecomendacionResponse:
        return RecomendacionResponse(
            id=r.id,
            area=r.area.nombre,
            nivel_formacion=r.nivel_formacion,
            probabilidad=float(r.probabilidad) if r.probabilidad is not None else None,
            explicacion=r.explicacion,
            generada_en=r.generada_en,
            ya_calificada=self.repo.tiene_encuesta(r.id),
        )

    def generar(self, estudiante_id: uuid.UUID) -> RecomendacionResponse:
        notas = self.repo.notas_por_area(estudiante_id)
        puntajes = self.repo.puntajes_por_dimension(estudiante_id)
        if not notas or not puntajes:
            raise DatosInsuficientesError()

        modelo_activo = self.repo.obtener_modelo_activo()
        if modelo_activo is None:
            raise ModeloNoDisponibleError()

        prediccion = capa_ia.predecir({"notas": notas, "puntajes_riasec": puntajes})

        area = self.ofertas.obtener_area_por_nombre(prediccion.area_nombre)

        recomendacion = Recomendacion(
            estudiante_id=estudiante_id,
            modelo_id=modelo_activo.id,
            area_id=area.id,
            nivel_formacion=prediccion.nivel_formacion,
            probabilidad=prediccion.probabilidad,
            explicacion=prediccion.explicacion,
        )
        guardada = self.repo.guardar(recomendacion)

        estudiante = self.estudiantes.obtener_por_id(estudiante_id)
        if estudiante.estado_proceso in ("REGISTRADO", "AUTORIZADO", "DATOS_COMPLETOS"):
            estudiante.estado_proceso = "RECOMENDADO"
            self.db.commit()

        return self._a_response(guardada)

    def historial(self, estudiante_id: uuid.UUID) -> list[RecomendacionResponse]:
        return [self._a_response(r) for r in self.repo.listar_historial(estudiante_id)]
