from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import requerir_rol
from app.core.exceptions import AreaAcademicaInvalidaError, RecursoNoEncontradoError
from app.db.session import get_db
from app.schemas.admin import (
    BecaAdminResponse,
    BecaRequest,
    CarreraAdminResponse,
    CarreraRequest,
    InstitucionRequest,
    InstitucionResponse,
    ModeloMlResponse,
)
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["Administración"], dependencies=[Depends(requerir_rol("ADMINISTRADOR"))])


def _no_encontrado(mensaje: str):
    return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=mensaje)


def _area_invalida(err: Exception):
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=f"El área de conocimiento '{err}' no existe.",
    )


# ---------- Instituciones ----------

@router.get("/instituciones", response_model=list[InstitucionResponse])
def listar_instituciones(db: Session = Depends(get_db)):
    return AdminService(db).listar_instituciones()


@router.post("/instituciones", response_model=InstitucionResponse, status_code=status.HTTP_201_CREATED)
def crear_institucion(datos: InstitucionRequest, db: Session = Depends(get_db)):
    return AdminService(db).crear_institucion(datos)


@router.put("/instituciones/{institucion_id}", response_model=InstitucionResponse)
def actualizar_institucion(institucion_id: int, datos: InstitucionRequest, db: Session = Depends(get_db)):
    try:
        return AdminService(db).actualizar_institucion(institucion_id, datos)
    except RecursoNoEncontradoError:
        raise _no_encontrado("Esa institución no existe.")


# ---------- Carreras ----------

@router.get("/carreras", response_model=list[CarreraAdminResponse])
def listar_carreras(db: Session = Depends(get_db)):
    return AdminService(db).listar_carreras()


@router.post("/carreras", response_model=CarreraAdminResponse, status_code=status.HTTP_201_CREATED)
def crear_carrera(datos: CarreraRequest, db: Session = Depends(get_db)):
    try:
        return AdminService(db).crear_carrera(datos)
    except AreaAcademicaInvalidaError as err:
        raise _area_invalida(err)


@router.put("/carreras/{carrera_id}", response_model=CarreraAdminResponse)
def actualizar_carrera(carrera_id: int, datos: CarreraRequest, db: Session = Depends(get_db)):
    try:
        return AdminService(db).actualizar_carrera(carrera_id, datos)
    except RecursoNoEncontradoError:
        raise _no_encontrado("Esa carrera no existe.")
    except AreaAcademicaInvalidaError as err:
        raise _area_invalida(err)


# ---------- Becas ----------

@router.get("/becas", response_model=list[BecaAdminResponse])
def listar_becas(db: Session = Depends(get_db)):
    return AdminService(db).listar_becas()


@router.post("/becas", response_model=BecaAdminResponse, status_code=status.HTTP_201_CREATED)
def crear_beca(datos: BecaRequest, db: Session = Depends(get_db)):
    try:
        return AdminService(db).crear_beca(datos)
    except AreaAcademicaInvalidaError as err:
        raise _area_invalida(err)


@router.put("/becas/{beca_id}", response_model=BecaAdminResponse)
def actualizar_beca(beca_id: int, datos: BecaRequest, db: Session = Depends(get_db)):
    try:
        return AdminService(db).actualizar_beca(beca_id, datos)
    except RecursoNoEncontradoError:
        raise _no_encontrado("Esa beca no existe.")
    except AreaAcademicaInvalidaError as err:
        raise _area_invalida(err)


# ---------- Modelos de IA ----------

@router.get("/modelos", response_model=list[ModeloMlResponse])
def listar_modelos(db: Session = Depends(get_db)):
    return AdminService(db).listar_modelos()


@router.put("/modelos/{modelo_id}/activar", response_model=ModeloMlResponse)
def activar_modelo(modelo_id: int, db: Session = Depends(get_db)):
    try:
        return AdminService(db).activar_modelo(modelo_id)
    except RecursoNoEncontradoError:
        raise _no_encontrado("Ese modelo no existe.")
