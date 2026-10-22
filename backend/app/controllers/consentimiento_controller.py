from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import requerir_rol
from app.core.exceptions import EstudianteNoVinculadoError
from app.db.session import get_db
from app.schemas.auth import UsuarioActual
from app.schemas.consentimiento import (
    ConsentimientoRequest,
    ConsentimientoResponse,
    EstadoConsentimientoResponse,
)
from app.services.consentimiento_service import ConsentimientoService

router = APIRouter(prefix="/consentimientos", tags=["Consentimiento"])


@router.post("/acudiente", response_model=ConsentimientoResponse)
def otorgar_consentimiento(
    datos: ConsentimientoRequest,
    usuario: UsuarioActual = Depends(requerir_rol("ACUDIENTE")),
    db: Session = Depends(get_db),
):
    try:
        consentimiento = ConsentimientoService(db).otorgar_consentimiento_acudiente(
            usuario.id, datos.aceptado
        )
    except EstudianteNoVinculadoError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tienes ningún estudiante vinculado a tu cuenta.",
        )
    return consentimiento


@router.post("/asentimiento", response_model=ConsentimientoResponse)
def otorgar_asentimiento(
    datos: ConsentimientoRequest,
    usuario: UsuarioActual = Depends(requerir_rol("ESTUDIANTE")),
    db: Session = Depends(get_db),
):
    consentimiento = ConsentimientoService(db).otorgar_asentimiento_estudiante(
        usuario.id, datos.aceptado
    )
    return consentimiento


@router.get("/estado", response_model=EstadoConsentimientoResponse)
def estado_autorizacion(
    usuario: UsuarioActual = Depends(requerir_rol("ESTUDIANTE")),
    db: Session = Depends(get_db),
):
    return ConsentimientoService(db).obtener_estado(usuario.id)


@router.get("/estado-acudiente", response_model=EstadoConsentimientoResponse)
def estado_autorizacion_acudiente(
    usuario: UsuarioActual = Depends(requerir_rol("ACUDIENTE")),
    db: Session = Depends(get_db),
):
    try:
        return ConsentimientoService(db).obtener_estado_para_acudiente(usuario.id)
    except EstudianteNoVinculadoError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No tienes ningún estudiante vinculado a tu cuenta.",
        )
