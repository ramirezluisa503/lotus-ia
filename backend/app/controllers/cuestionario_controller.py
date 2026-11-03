import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.deps import obtener_estudiante_id_actual, requerir_estudiante_autorizado
from app.core.exceptions import (
    AreaAcademicaInvalidaError,
    InstrumentoNoDisponibleError,
    PdfIcfesNoReconocidoError,
)
from app.db.session import get_db
from app.schemas.cuestionario import (
    DatosAcademicosRequest,
    DatosSociodemograficosRequest,
    DatosSocioeconomicosRequest,
    EstadoProcesoResponse,
    ExtraccionIcfesResponse,
    InstrumentoActivoResponse,
    MisRespuestasResponse,
    PasoGuardadoResponse,
    PerfilPsicometricoResponse,
    RespuestasPsicometricoRequest,
)
from app.services.cuestionario_service import CuestionarioService

cuestionario_router = APIRouter(prefix="/cuestionario", tags=["Cuestionarios"])
instrumentos_router = APIRouter(prefix="/instrumentos", tags=["Cuestionarios"])

TAMANO_MAXIMO_PDF = 5 * 1024 * 1024  # 5 MB


@cuestionario_router.post("/academico/extraer-pdf", response_model=ExtraccionIcfesResponse)
async def extraer_academico_de_pdf(
    archivo: UploadFile = File(...),
    _estudiante_id: uuid.UUID = Depends(obtener_estudiante_id_actual),
    db: Session = Depends(get_db),
):
    if archivo.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El archivo debe ser un PDF.")

    contenido = await archivo.read()
    if len(contenido) > TAMANO_MAXIMO_PDF:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El PDF es demasiado grande (máximo 5 MB).",
        )

    try:
        return CuestionarioService(db).extraer_academico_de_pdf(contenido)
    except PdfIcfesNoReconocidoError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "No pudimos leer este PDF automáticamente. Verifica que sea el reporte "
                "oficial de resultados del ICFES, o completa los datos a mano."
            ),
        )


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


@cuestionario_router.get("/mi-estado", response_model=EstadoProcesoResponse)
def mi_estado(
    estudiante_id: uuid.UUID = Depends(obtener_estudiante_id_actual),
    db: Session = Depends(get_db),
):
    return CuestionarioService(db).obtener_mi_estado(estudiante_id)


@cuestionario_router.get("/mis-respuestas", response_model=MisRespuestasResponse)
def mis_respuestas(
    estudiante_id: uuid.UUID = Depends(obtener_estudiante_id_actual),
    db: Session = Depends(get_db),
):
    return CuestionarioService(db).obtener_mis_respuestas(estudiante_id)


@cuestionario_router.get("/psicometrico/perfil", response_model=PerfilPsicometricoResponse)
def perfil_psicometrico(
    estudiante_id: uuid.UUID = Depends(obtener_estudiante_id_actual),
    db: Session = Depends(get_db),
):
    return CuestionarioService(db).obtener_perfil_psicometrico(estudiante_id)


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
