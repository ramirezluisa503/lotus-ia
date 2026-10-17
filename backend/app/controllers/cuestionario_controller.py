import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import requerir_estudiante_autorizado
from app.core.exceptions import AreaAcademicaInvalidaError, InstrumentoNoDisponibleError
from app.db.session import get_db
from app.schemas.cuestionario import (
    DatosAcademicosRequest,
    DatosSociodemograficosRequest,
    DatosSocioeconomicosRequest,
    InstrumentoActivoResponse,
    PasoGuardadoResponse,
    RespuestasPsicometricoRequest,
)
from app.services.cuestionario_service import CuestionarioService

cuestionario_router = APIRouter(prefix="/cuestionario", tags=["Cuestionarios"])
instrumentos_router = APIRouter(prefix="/instrumentos", tags=["Cuestionarios"])


@cuestionario_router.put("/academico", response_model=PasoGuardadoResponse)
def guardar_academico(
    datos: DatosAcademicosRequest,
    estudiante_id: uuid.UUID = Depends(requerir_estudiante_autorizado),
    db: Session = Depends(get_db),
):
    try:
        estado = CuestionarioService(db).guardar_academico(estudiante_id, datos)
    except AreaAcademicaInvalidaError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"El área académica '{err}' no existe.",
        )
    return PasoGuardadoResponse(estado_proceso=estado)


@cuestionario_router.put("/sociodemografico", response_model=PasoGuardadoResponse)
def guardar_sociodemografico(
    datos: DatosSociodemograficosRequest,
    estudiante_id: uuid.UUID = Depends(requerir_estudiante_autorizado),
    db: Session = Depends(get_db),
):
    estado = CuestionarioService(db).guardar_sociodemografico(estudiante_id, datos)
    return PasoGuardadoResponse(estado_proceso=estado)


@cuestionario_router.put("/socioeconomico", response_model=PasoGuardadoResponse)
def guardar_socioeconomico(
    datos: DatosSocioeconomicosRequest,
    estudiante_id: uuid.UUID = Depends(requerir_estudiante_autorizado),
    db: Session = Depends(get_db),
):
    estado = CuestionarioService(db).guardar_socioeconomico(estudiante_id, datos)
    return PasoGuardadoResponse(estado_proceso=estado)


@instrumentos_router.get("/activo", response_model=InstrumentoActivoResponse)
def instrumento_activo(
    _estudiante_id: uuid.UUID = Depends(requerir_estudiante_autorizado),
    db: Session = Depends(get_db),
):
    try:
        return CuestionarioService(db).obtener_instrumento_activo()
    except InstrumentoNoDisponibleError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No hay un test disponible en este momento. Intenta más tarde.",
        )


@cuestionario_router.put("/psicometrico", response_model=PasoGuardadoResponse)
def guardar_psicometrico(
    datos: RespuestasPsicometricoRequest,
    estudiante_id: uuid.UUID = Depends(requerir_estudiante_autorizado),
    db: Session = Depends(get_db),
):
    try:
        estado = CuestionarioService(db).guardar_psicometrico(estudiante_id, datos)
    except InstrumentoNoDisponibleError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No hay un test disponible en este momento. Intenta más tarde.",
        )
    return PasoGuardadoResponse(estado_proceso=estado)
