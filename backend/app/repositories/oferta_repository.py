from datetime import date

from sqlalchemy.orm import Session

from app.models.area_conocimiento import AreaConocimiento
from app.models.beca import Beca, BecaArea
from app.models.carrera import Carrera


class OfertaRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_areas(self) -> list[AreaConocimiento]:
        return self.db.query(AreaConocimiento).order_by(AreaConocimiento.nombre).all()

    def obtener_area_por_nombre(self, nombre: str) -> AreaConocimiento | None:
        return self.db.query(AreaConocimiento).filter(AreaConocimiento.nombre == nombre).first()

    def listar_carreras(
        self, area_id: int | None, nivel: str | None, costo_max: float | None
    ) -> list[Carrera]:
        consulta = self.db.query(Carrera).filter(Carrera.vigente.is_(True))
        if area_id is not None:
            consulta = consulta.filter(Carrera.area_id == area_id)
        if nivel is not None:
            consulta = consulta.filter(Carrera.nivel_formacion == nivel)
        if costo_max is not None:
            consulta = consulta.filter(Carrera.costo_semestre <= costo_max)
        return consulta.order_by(Carrera.nombre).all()

    def listar_becas(self, area_id: int | None) -> list[Beca]:
        consulta = self.db.query(Beca).filter(
            Beca.vigente.is_(True),
            (Beca.fecha_cierre.is_(None)) | (Beca.fecha_cierre >= date.today()),
        )
        if area_id is not None:
            consulta = consulta.join(BecaArea, BecaArea.beca_id == Beca.id).filter(
                BecaArea.area_id == area_id
            )
        return consulta.order_by(Beca.nombre).all()
