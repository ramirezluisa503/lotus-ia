from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import obtener_usuario_actual
from app.core.email import enviar_correo_recuperacion
from app.core.exceptions import (
    CorreoYaRegistradoError,
    CredencialesInvalidasError,
    CuentaBloqueadaError,
    EstudianteNoEncontradoError,
    TokenRecuperacionInvalidoError,
)
from app.db.session import get_db
from app.schemas.auth import (
    LoginRequest,
    MensajeResponse,
    OlvideContrasenaRequest,
    RegistroRequest,
    RegistroResponse,
    RestablecerContrasenaRequest,
    TokenResponse,
    UsuarioActual,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/registro", response_model=RegistroResponse, status_code=status.HTTP_201_CREATED)
def registrar(datos: RegistroRequest, db: Session = Depends(get_db)):
    try:
        usuario = AuthService(db).registrar(datos)
    except CorreoYaRegistradoError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta registrada con ese correo.",
        )
    except EstudianteNoEncontradoError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No encontramos un estudiante registrado con ese correo. Pídele que cree su cuenta primero.",
        )
    return RegistroResponse(id=usuario.id, correo=usuario.correo, rol=datos.rol)


@router.post("/login", response_model=TokenResponse)
def iniciar_sesion(datos: LoginRequest, db: Session = Depends(get_db)):
    try:
        token, usuario = AuthService(db).login(datos)
    except CredencialesInvalidasError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos.",
        )
    except CuentaBloqueadaError:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demasiados intentos fallidos. Espera unos minutos antes de volver a intentarlo.",
        )
    return TokenResponse(access_token=token, rol=usuario.rol.nombre, usuario_id=usuario.id)


@router.get("/me", response_model=UsuarioActual)
def usuario_actual(usuario: UsuarioActual = Depends(obtener_usuario_actual)):
    return usuario


@router.post("/olvide-contrasena", response_model=MensajeResponse)
def olvide_contrasena(
    datos: OlvideContrasenaRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    resultado = AuthService(db).solicitar_recuperacion(datos.correo)
    if resultado is not None:
        correo_destino, enlace = resultado
        background_tasks.add_task(enviar_correo_recuperacion, correo_destino, enlace)
    return MensajeResponse(
        mensaje="Si ese correo está registrado, te enviamos un enlace para restablecer tu contraseña."
    )


@router.post("/restablecer-contrasena", response_model=MensajeResponse)
def restablecer_contrasena(datos: RestablecerContrasenaRequest, db: Session = Depends(get_db)):
    try:
        AuthService(db).restablecer_contrasena(datos.token, datos.nueva_contrasena)
    except TokenRecuperacionInvalidoError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace de recuperación no es válido o ya expiró. Solicita uno nuevo.",
        )
    return MensajeResponse(mensaje="Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.")
