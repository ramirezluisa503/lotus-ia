import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import AreaAcademicaInvalidaError
from app.repositories.oferta_repository import OfertaRepository
from app.schemas.oferta import AreaConocimientoResponse, BecaResponse, CarreraResponse


class OfertaAcademicaService:
    def __init__(self, db: Session):
        self.repo = OfertaRepository(db)

    def _resolver_area_id(self, area: str | None) -> int | None:
        if area is None:
            return None
        area_obj = self.repo.obtener_area_por_nombre(area)
        if area_obj is None:
            raise AreaAcademicaInvalidaError(area)
        return area_obj.id

    def listar_areas(self) -> list[AreaConocimientoResponse]:
        return [
            AreaConocimientoResponse(id=a.id, nombre=a.nombre) for a in self.repo.listar_areas()
        ]

    def listar_carreras_recomendadas(
        self, estudiante_id: uuid.UUID, costo_max: float | None
    ) -> list[CarreraResponse]:
        pares = self.repo.pares_area_nivel_recomendados(estudiante_id)
        carreras = self.repo.listar_carreras_por_pares(pares, costo_max)
        return [
            CarreraResponse(
                id=c.id,
                institucion=c.institucion.nombre,
                nombre=c.nombre,
                nivel_formacion=c.nivel_formacion,
                modalidad=c.modalidad,
                duracion_semestres=c.duracion_semestres,
                costo_semestre=float(c.costo_semestre) if c.costo_semestre is not None else None,
                sitio_web=c.institucion.sitio_web,
            )
            for c in carreras
        ]

    def listar_becas(self, area: str | None) -> list[BecaResponse]:
        area_id = self._resolver_area_id(area)
        becas = self.repo.listar_becas(area_id)
        return [
            BecaResponse(
                id=b.id,
                nombre=b.nombre,
                entidad=b.entidad,
                descripcion=b.descripcion,
                cobertura=b.cobertura,
                estrato_maximo=b.estrato_maximo,
                url=b.url,
                fecha_cierre=b.fecha_cierre,
            )
            for b in becas
        ]
