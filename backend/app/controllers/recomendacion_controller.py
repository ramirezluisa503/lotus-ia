import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import requerir_estudiante_autorizado
from app.core.exceptions import DatosInsuficientesError, ModeloNoDisponibleError
from app.db.session import get_db
from app.schemas.recomendacion import RecomendacionResponse
from app.services.recomendacion_service import RecomendacionService

router = APIRouter(prefix="/recomendaciones", tags=["Recomendación"])


@router.post("", response_model=RecomendacionResponse, status_code=status.HTTP_201_CREATED)
def generar_recomendacion(
    estudiante_id: uuid.UUID = Depends(requerir_estudiante_autorizado),
    db: Session = Depends(get_db),
):
    try:
        return RecomendacionService(db).generar(estudiante_id)
    except DatosInsuficientesError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Completa tu cuestionario (notas y test de intereses) antes de generar tu recomendación.",
        )
    except ModeloNoDisponibleError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No pudimos generar tu resultado. Intenta de nuevo en unos minutos.",
        )


@router.get("", response_model=list[RecomendacionResponse])
def historial_recomendaciones(
    estudiante_id: uuid.UUID = Depends(requerir_estudiante_autorizado),
    db: Session = Depends(get_db),
):
    return RecomendacionService(db).historial(estudiante_id)
