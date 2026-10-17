from sqlalchemy.orm import Session

from app.models.rol import Rol


class RolRepository:
    def __init__(self, db: Session):
        self.db = db

    def obtener_por_nombre(self, nombre: str) -> Rol | None:
        return self.db.query(Rol).filter(Rol.nombre == nombre).first()
