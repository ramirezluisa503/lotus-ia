import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import RecomendacionNoEncontradaError, RecomendacionYaCalificadaError
from app.models.encuesta_satisfaccion import EncuestaSatisfaccion
from app.repositories.encuesta_repository import EncuestaRepository
from app.repositories.recomendacion_repository import RecomendacionRepository
from app.schemas.encuesta import EncuestaRequest


class EncuestaService:
    def __init__(self, db: Session):
        self.encuestas = EncuestaRepository(db)
        self.recomendaciones = RecomendacionRepository(db)

    def registrar(self, estudiante_id: uuid.UUID, datos: EncuestaRequest) -> EncuestaSatisfaccion:
        recomendacion = self.recomendaciones.obtener_por_id(datos.recomendacion_id)
        if recomendacion is None or recomendacion.estudiante_id != estudiante_id:
            raise RecomendacionNoEncontradaError()

        if self.recomendaciones.tiene_encuesta(datos.recomendacion_id):
            raise RecomendacionYaCalificadaError()

        encuesta = EncuestaSatisfaccion(
            recomendacion_id=datos.recomendacion_id,
            calificacion=datos.calificacion,
            comentario=datos.comentario,
        )
        return self.encuestas.guardar(encuesta)
