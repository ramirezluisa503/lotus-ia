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

    def listar_vinculos(self, acudiente_id: uuid.UUID) -> list[VinculoAcudiente]:
        return (
            self.db.query(VinculoAcudiente)
            .filter(VinculoAcudiente.acudiente_id == acudiente_id)
            .all()
        )

    def existe_vinculo(self, acudiente_id: uuid.UUID, estudiante_usuario_id: uuid.UUID) -> bool:
        return (
            self.db.query(VinculoAcudiente)
            .filter(
                VinculoAcudiente.acudiente_id == acudiente_id,
                VinculoAcudiente.estudiante_usuario_id == estudiante_usuario_id,
            )
            .first()
            is not None
        )
