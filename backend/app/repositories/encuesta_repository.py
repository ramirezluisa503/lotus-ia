from sqlalchemy.orm import Session

from app.models.encuesta_satisfaccion import EncuestaSatisfaccion


class EncuestaRepository:
    def __init__(self, db: Session):
        self.db = db

    def guardar(self, encuesta: EncuestaSatisfaccion) -> EncuestaSatisfaccion:
        self.db.add(encuesta)
        self.db.commit()
        self.db.refresh(encuesta)
        return encuesta
