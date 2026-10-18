import uuid

from sqlalchemy.orm import Session

from app.models.area_academica import AreaAcademica
from app.models.datos_socioeconomicos import DatosSocioeconomicos
from app.models.encuesta_satisfaccion import EncuestaSatisfaccion
from app.models.estudiante import Estudiante
from app.models.modelo_ml import ModeloMl
from app.models.recomendacion import Recomendacion
from app.models.rendimiento_academico import RendimientoAcademico


class RecomendacionRepository:
    def __init__(self, db: Session):
        self.db = db

    def obtener_modelo_activo(self) -> ModeloMl | None:
        return self.db.query(ModeloMl).filter(ModeloMl.activo.is_(True)).first()

    def obtener_estudiante(self, estudiante_id: uuid.UUID) -> Estudiante | None:
        return self.db.get(Estudiante, estudiante_id)

    def obtener_datos_socioeconomicos(self, estudiante_id: uuid.UUID) -> DatosSocioeconomicos | None:
        return self.db.get(DatosSocioeconomicos, estudiante_id)

    def notas_por_area(self, estudiante_id: uuid.UUID) -> dict[str, float]:
        filas = (
            self.db.query(AreaAcademica.nombre, RendimientoAcademico.nota)
            .join(AreaAcademica, AreaAcademica.id == RendimientoAcademico.area_id)
            .filter(RendimientoAcademico.estudiante_id == estudiante_id)
            .all()
        )
        return {nombre: float(nota) for nombre, nota in filas}

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
