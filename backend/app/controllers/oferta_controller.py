import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import requerir_estudiante_autorizado, requerir_rol
from app.core.exceptions import AreaAcademicaInvalidaError
from app.db.session import get_db
from app.schemas.oferta import AreaConocimientoResponse, BecaResponse, CarreraResponse
from app.services.oferta_service import OfertaAcademicaService

router = APIRouter(prefix="/oferta", tags=["Oferta académica"])


@router.get("/areas", response_model=list[AreaConocimientoResponse])
def listar_areas(
    _usuario=Depends(requerir_rol("ESTUDIANTE", "ADMINISTRADOR")),
    db: Session = Depends(get_db),
):
    return OfertaAcademicaService(db).listar_areas()


@router.get("/carreras", response_model=list[CarreraResponse])
def listar_carreras(
    costo_max: float | None = None,
    estudiante_id: uuid.UUID = Depends(requerir_estudiante_autorizado),
    db: Session = Depends(get_db),
):
    """Solo devuelve carreras del área y nivel de formación que la IA le ha
    recomendado a este estudiante -- no el catálogo completo."""
    return OfertaAcademicaService(db).listar_carreras_recomendadas(estudiante_id, costo_max)


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
