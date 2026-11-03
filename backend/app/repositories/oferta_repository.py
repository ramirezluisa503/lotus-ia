import uuid
from datetime import date

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.models.area_conocimiento import AreaConocimiento
from app.models.beca import Beca, BecaArea
from app.models.carrera import Carrera
from app.models.recomendacion import Recomendacion


class OfertaRepository:
    def __init__(self, db: Session):
        self.db = db

    def listar_areas(self) -> list[AreaConocimiento]:
        return self.db.query(AreaConocimiento).order_by(AreaConocimiento.nombre).all()

    def obtener_area_por_nombre(self, nombre: str) -> AreaConocimiento | None:
        return self.db.query(AreaConocimiento).filter(AreaConocimiento.nombre == nombre).first()

    def pares_area_nivel_recomendados(self, estudiante_id: uuid.UUID) -> list[tuple[int, str]]:
        """Devuelve los pares (área, nivel de formación) únicos de todas las
        recomendaciones que ha recibido el estudiante, sin importar cuándo
        -- el estudiante solo debe ver oferta que coincida con lo que la IA
        le ha recomendado alguna vez."""
        filas = (
            self.db.query(Recomendacion.area_id, Recomendacion.nivel_formacion)
            .filter(Recomendacion.estudiante_id == estudiante_id)
            .distinct()
            .all()
        )
        return [(area_id, nivel) for area_id, nivel in filas]

    def listar_carreras_por_pares(
        self, pares: list[tuple[int, str]], costo_max: float | None
    ) -> list[Carrera]:
        if not pares:
            return []
        consulta = self.db.query(Carrera).filter(
            Carrera.vigente.is_(True),
            or_(*(and_(Carrera.area_id == area_id, Carrera.nivel_formacion == nivel) for area_id, nivel in pares)),
        )
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
