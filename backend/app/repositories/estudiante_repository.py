import uuid

from sqlalchemy.orm import Session

from app.models.estudiante import Estudiante
from app.models.seudonimo import Seudonimo


class EstudianteRepository:
    def __init__(self, db: Session):
        self.db = db

    def crear(self, estudiante: Estudiante) -> Estudiante:
        self.db.add(estudiante)
        self.db.flush()  # para obtener estudiante.id antes del commit
        return estudiante

    def obtener_por_id(self, estudiante_id: uuid.UUID) -> Estudiante | None:
        return self.db.get(Estudiante, estudiante_id)

    def vincular_usuario(self, usuario_id: uuid.UUID, estudiante_id: uuid.UUID) -> None:
        self.db.add(Seudonimo(usuario_id=usuario_id, estudiante_id=estudiante_id))

    def obtener_estudiante_id_de_usuario(self, usuario_id: uuid.UUID) -> uuid.UUID | None:
        seudonimo = self.db.get(Seudonimo, usuario_id)
        return seudonimo.estudiante_id if seudonimo else None
