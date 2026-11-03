from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import requerir_rol
from app.core.exceptions import EstudianteNoVinculadoError
from app.db.session import get_db
from app.schemas.auth import UsuarioActual
from app.schemas.consentimiento import (
    AcudienteVinculadoResponse,
    ConsentimientoAcudienteRequest,
    ConsentimientoRequest,
    ConsentimientoResponse,
    EstadoConsentimientoResponse,
    EstudianteVinculadoResponse,
)
from app.services.consentimiento_service import ConsentimientoService

router = APIRouter(prefix="/consentimientos", tags=["Consentimiento"])


@router.post("/acudiente", response_model=ConsentimientoResponse)
def otorgar_consentimiento(
    datos: ConsentimientoAcudienteRequest,
    usuario: UsuarioActual = Depends(requerir_rol("ACUDIENTE")),
    db: Session = Depends(get_db),
):
    try:
        consentimiento = ConsentimientoService(db).otorgar_consentimiento_acudiente(
            usuario.id, datos.estudiante_usuario_id, datos.aceptado
        )
    except EstudianteNoVinculadoError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ese estudiante no está vinculado a tu cuenta.",
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


@router.get("/estudiantes", response_model=list[EstudianteVinculadoResponse])
def estudiantes_a_cargo(
    usuario: UsuarioActual = Depends(requerir_rol("ACUDIENTE")),
    db: Session = Depends(get_db),
):
    return ConsentimientoService(db).listar_estudiantes_para_acudiente(usuario.id)


@router.get("/mi-acudiente", response_model=list[AcudienteVinculadoResponse])
def mi_acudiente(
    usuario: UsuarioActual = Depends(requerir_rol("ESTUDIANTE")),
    db: Session = Depends(get_db),
):
    return ConsentimientoService(db).listar_acudientes_para_estudiante(usuario.id)
