from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import requerir_rol
from app.core.exceptions import AreaAcademicaInvalidaError
from app.db.session import get_db
from app.schemas.oferta import AreaConocimientoResponse, BecaResponse, CarreraResponse
from app.services.oferta_service import OfertaAcademicaService

router = APIRouter(prefix="/oferta", tags=["Oferta académica"])


@router.get("/areas", response_model=list[AreaConocimientoResponse])
def listar_areas(
    _usuario=Depends(requerir_rol("ESTUDIANTE")),
    db: Session = Depends(get_db),
):
    return OfertaAcademicaService(db).listar_areas()


@router.get("/carreras", response_model=list[CarreraResponse])
def listar_carreras(
    area: str | None = None,
    nivel: str | None = None,
    costo_max: float | None = None,
    _usuario=Depends(requerir_rol("ESTUDIANTE")),
    db: Session = Depends(get_db),
):
    try:
        return OfertaAcademicaService(db).listar_carreras(area, nivel, costo_max)
    except AreaAcademicaInvalidaError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"El área de conocimiento '{err}' no existe.",
        )


@router.get("/becas", response_model=list[BecaResponse])
def listar_becas(
    area: str | None = None,
    _usuario=Depends(requerir_rol("ESTUDIANTE")),
    db: Session = Depends(get_db),
):
    try:
        return OfertaAcademicaService(db).listar_becas(area)
    except AreaAcademicaInvalidaError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"El área de conocimiento '{err}' no existe.",
        )
