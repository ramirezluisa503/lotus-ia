import uuid

from sqlalchemy.orm import Session

from app.models.encuesta_satisfaccion import EncuestaSatisfaccion
from app.models.modelo_ml import ModeloMl
from app.models.recomendacion import Recomendacion
from app.models.rendimiento_academico import RendimientoAcademico
from app.models.area_academica import AreaAcademica
from app.models.pregunta import Pregunta
from app.models.respuesta import Respuesta


class RecomendacionRepository:
    def __init__(self, db: Session):
        self.db = db

    def obtener_modelo_activo(self) -> ModeloMl | None:
        return self.db.query(ModeloMl).filter(ModeloMl.activo.is_(True)).first()

    def notas_por_area(self, estudiante_id: uuid.UUID) -> dict[str, float]:
        filas = (
            self.db.query(AreaAcademica.nombre, RendimientoAcademico.nota)
            .join(AreaAcademica, AreaAcademica.id == RendimientoAcademico.area_id)
            .filter(RendimientoAcademico.estudiante_id == estudiante_id)
            .all()
        )
        return {nombre: float(nota) for nombre, nota in filas}

    def puntajes_por_dimension(self, estudiante_id: uuid.UUID) -> dict[str, int]:
        filas = (
            self.db.query(Pregunta.dimension, Respuesta.valor)
            .join(Respuesta, Respuesta.pregunta_id == Pregunta.id)
            .filter(Respuesta.estudiante_id == estudiante_id)
            .all()
        )
        puntajes: dict[str, int] = {}
        for dimension, valor in filas:
            puntajes[dimension] = puntajes.get(dimension, 0) + valor
        return puntajes

    def guardar(self, recomendacion: Recomendacion) -> Recomendacion:
        self.db.add(recomendacion)
        self.db.commit()
        self.db.refresh(recomendacion)
        return recomendacion

    def listar_historial(self, estudiante_id: uuid.UUID) -> list[Recomendacion]:
        return (
            self.db.query(Recomendacion)
            .filter(Recomendacion.estudiante_id == estudiante_id)
            .order_by(Recomendacion.generada_en.desc())
            .all()
        )

    def obtener_por_id(self, recomendacion_id: int) -> Recomendacion | None:
        return self.db.get(Recomendacion, recomendacion_id)

    def tiene_encuesta(self, recomendacion_id: int) -> bool:
        return (
            self.db.query(EncuestaSatisfaccion)
            .filter(EncuestaSatisfaccion.recomendacion_id == recomendacion_id)
            .first()
            is not None
        )
