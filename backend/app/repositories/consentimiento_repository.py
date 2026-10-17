import uuid

from sqlalchemy.orm import Session

from app.models.consentimiento import Consentimiento


class ConsentimientoRepository:
    def __init__(self, db: Session):
        self.db = db

    def obtener_vigente(self, estudiante_id: uuid.UUID, tipo: str, version_texto: str) -> Consentimiento | None:
        return (
            self.db.query(Consentimiento)
            .filter(
                Consentimiento.estudiante_id == estudiante_id,
                Consentimiento.tipo == tipo,
                Consentimiento.version_texto == version_texto,
            )
            .first()
        )

    def guardar(self, consentimiento: Consentimiento) -> Consentimiento:
        self.db.add(consentimiento)
        self.db.commit()
        self.db.refresh(consentimiento)
        return consentimiento
