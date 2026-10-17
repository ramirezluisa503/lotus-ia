import uuid

from sqlalchemy.orm import Session

from app.models.vinculo_acudiente import VinculoAcudiente


class VinculoAcudienteRepository:
    def __init__(self, db: Session):
        self.db = db

    def crear(self, acudiente_id: uuid.UUID, estudiante_usuario_id: uuid.UUID, parentesco: str) -> None:
        self.db.add(
            VinculoAcudiente(
                acudiente_id=acudiente_id,
                estudiante_usuario_id=estudiante_usuario_id,
                parentesco=parentesco,
            )
        )

    def obtener_estudiante_vinculado(self, acudiente_id: uuid.UUID) -> uuid.UUID | None:
        """Devuelve el usuario_id del primer estudiante vinculado a este acudiente."""
        vinculo = (
            self.db.query(VinculoAcudiente)
            .filter(VinculoAcudiente.acudiente_id == acudiente_id)
            .first()
        )
        return vinculo.estudiante_usuario_id if vinculo else None
