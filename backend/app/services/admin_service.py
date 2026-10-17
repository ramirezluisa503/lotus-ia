from sqlalchemy.orm import Session

from app.core.exceptions import AreaAcademicaInvalidaError, RecursoNoEncontradoError
from app.models.beca import Beca
from app.models.carrera import Carrera
from app.models.institucion import InstitucionEducativa
from app.repositories.admin_repository import AdminRepository
from app.repositories.oferta_repository import OfertaRepository
from app.schemas.admin import (
    BecaAdminResponse,
    BecaRequest,
    CarreraAdminResponse,
    CarreraRequest,
    InstitucionRequest,
    InstitucionResponse,
    ModeloMlResponse,
)


class AdminService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AdminRepository(db)
        self.ofertas = OfertaRepository(db)

    # ---------- Instituciones ----------

    def listar_instituciones(self) -> list[InstitucionResponse]:
        return [InstitucionResponse(**self._campos_institucion(i)) for i in self.repo.listar_instituciones()]

    def crear_institucion(self, datos: InstitucionRequest) -> InstitucionResponse:
        institucion = InstitucionEducativa(**datos.model_dump())
        guardada = self.repo.guardar_institucion(institucion)
        return InstitucionResponse(**self._campos_institucion(guardada))

    def actualizar_institucion(self, institucion_id: int, datos: InstitucionRequest) -> InstitucionResponse:
        institucion = self.repo.obtener_institucion(institucion_id)
        if institucion is None:
            raise RecursoNoEncontradoError()
        for campo, valor in datos.model_dump().items():
            setattr(institucion, campo, valor)
        guardada = self.repo.guardar_institucion(institucion)
        return InstitucionResponse(**self._campos_institucion(guardada))

    @staticmethod
    def _campos_institucion(i: InstitucionEducativa) -> dict:
        return {
            "id": i.id, "nombre": i.nombre, "caracter": i.caracter,
            "sector": i.sector, "sitio_web": i.sitio_web, "direccion": i.direccion,
        }

    # ---------- Carreras ----------

    def listar_carreras(self) -> list[CarreraAdminResponse]:
        return [self._a_carrera_response(c) for c in self.repo.listar_carreras()]

    def crear_carrera(self, datos: CarreraRequest) -> CarreraAdminResponse:
        area = self.ofertas.obtener_area_por_nombre(datos.area)
        if area is None:
            raise AreaAcademicaInvalidaError(datos.area)
        carrera = Carrera(**{**datos.model_dump(exclude={"area"}), "area_id": area.id})
        guardada = self.repo.guardar_carrera(carrera)
        return self._a_carrera_response(guardada)

    def actualizar_carrera(self, carrera_id: int, datos: CarreraRequest) -> CarreraAdminResponse:
        carrera = self.repo.obtener_carrera(carrera_id)
        if carrera is None:
            raise RecursoNoEncontradoError()
        area = self.ofertas.obtener_area_por_nombre(datos.area)
        if area is None:
            raise AreaAcademicaInvalidaError(datos.area)
        for campo, valor in datos.model_dump(exclude={"area"}).items():
            setattr(carrera, campo, valor)
        carrera.area_id = area.id
        guardada = self.repo.guardar_carrera(carrera)
        return self._a_carrera_response(guardada)

    @staticmethod
    def _a_carrera_response(c: Carrera) -> CarreraAdminResponse:
        return CarreraAdminResponse(
            id=c.id, institucion_id=c.institucion_id, institucion=c.institucion.nombre,
            area=c.area.nombre, nombre=c.nombre, nivel_formacion=c.nivel_formacion,
            modalidad=c.modalidad, duracion_semestres=c.duracion_semestres,
            costo_semestre=float(c.costo_semestre) if c.costo_semestre is not None else None,
            vigente=c.vigente, actualizado_en=c.actualizado_en,
        )

    # ---------- Becas ----------

    def listar_becas(self) -> list[BecaAdminResponse]:
        return [self._a_beca_response(b) for b in self.repo.listar_becas()]

    def crear_beca(self, datos: BecaRequest) -> BecaAdminResponse:
        area_ids = self._resolver_areas(datos.areas)
        beca = Beca(**datos.model_dump(exclude={"areas"}))
        guardada = self.repo.guardar_beca(beca)
        self.repo.reemplazar_areas_beca(guardada.id, area_ids)
        return self._a_beca_response(guardada)

    def actualizar_beca(self, beca_id: int, datos: BecaRequest) -> BecaAdminResponse:
        beca = self.repo.obtener_beca(beca_id)
        if beca is None:
            raise RecursoNoEncontradoError()
        area_ids = self._resolver_areas(datos.areas)
        for campo, valor in datos.model_dump(exclude={"areas"}).items():
            setattr(beca, campo, valor)
        guardada = self.repo.guardar_beca(beca)
        self.repo.reemplazar_areas_beca(guardada.id, area_ids)
        return self._a_beca_response(guardada)

    def _resolver_areas(self, nombres: list[str]) -> list[int]:
        ids = []
        for nombre in nombres:
            area = self.ofertas.obtener_area_por_nombre(nombre)
            if area is None:
                raise AreaAcademicaInvalidaError(nombre)
            ids.append(area.id)
        return ids

    def _a_beca_response(self, b: Beca) -> BecaAdminResponse:
        areas_ids = self.repo.areas_de_beca(b.id)
        areas_nombres = self._nombres_de_areas(areas_ids)
        return BecaAdminResponse(
            id=b.id, institucion_id=b.institucion_id, nombre=b.nombre, entidad=b.entidad,
            descripcion=b.descripcion, cobertura=b.cobertura, estrato_maximo=b.estrato_maximo,
            url=b.url, fecha_cierre=b.fecha_cierre, vigente=b.vigente,
            areas=areas_nombres, actualizado_en=b.actualizado_en,
        )

    def _nombres_de_areas(self, area_ids: list[int]) -> list[str]:
        todas = {a.id: a.nombre for a in self.ofertas.listar_areas()}
        return [todas[i] for i in area_ids if i in todas]

    # ---------- Modelos de IA ----------

    def listar_modelos(self) -> list[ModeloMlResponse]:
        return [self._a_modelo_response(m) for m in self.repo.listar_modelos()]

    def activar_modelo(self, modelo_id: int) -> ModeloMlResponse:
        if self.repo.obtener_modelo(modelo_id) is None:
            raise RecursoNoEncontradoError()
        return self._a_modelo_response(self.repo.activar_modelo(modelo_id))

    @staticmethod
    def _a_modelo_response(m) -> ModeloMlResponse:
        return ModeloMlResponse(
            id=m.id, version=m.version, algoritmo=m.algoritmo,
            exactitud=float(m.exactitud) if m.exactitud is not None else None,
            precision_macro=float(m.precision_macro) if m.precision_macro is not None else None,
            recall_macro=float(m.recall_macro) if m.recall_macro is not None else None,
            f1_macro=float(m.f1_macro) if m.f1_macro is not None else None,
            entrenado_en=m.entrenado_en, activo=m.activo,
        )
