import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import requerir_estudiante_autorizado
from app.core.exceptions import RecomendacionNoEncontradaError, RecomendacionYaCalificadaError
from app.db.session import get_db
from app.schemas.encuesta import EncuestaRequest, EncuestaResponse
from app.services.encuesta_service import EncuestaService

router = APIRouter(prefix="/encuestas", tags=["Encuesta de satisfacción"])


@router.post("", response_model=EncuestaResponse, status_code=status.HTTP_201_CREATED)
def registrar_encuesta(
    datos: EncuestaRequest,
    estudiante_id: uuid.UUID = Depends(requerir_estudiante_autorizado),
    db: Session = Depends(get_db),
):
    try:
        return EncuestaService(db).registrar(estudiante_id, datos)
    except RecomendacionNoEncontradaError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No encontramos esa recomendación.",
        )
    except RecomendacionYaCalificadaError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya registramos tu calificación para esta recomendación.",
        )
