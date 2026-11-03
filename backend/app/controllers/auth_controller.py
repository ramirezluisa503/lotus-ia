from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import obtener_usuario_actual, requerir_rol
from app.core.email import enviar_correo_aviso_acudiente, enviar_correo_recuperacion
from app.core.exceptions import (
    CorreoYaRegistradoError,
    CredencialesInvalidasError,
    CuentaBloqueadaError,
    DocumentoYaRegistradoError,
    EstudianteNoEncontradoError,
    EstudianteYaVinculadoError,
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
    VincularEstudianteRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/registro", response_model=RegistroResponse, status_code=status.HTTP_201_CREATED)
def registrar(datos: RegistroRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        usuario, aviso = AuthService(db).registrar(datos)
    except CorreoYaRegistradoError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta registrada con ese correo.",
        )
    except DocumentoYaRegistradoError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ese número de documento ya está registrado en otra cuenta.",
        )
    except EstudianteNoEncontradoError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No encontramos un estudiante registrado con ese correo. Pídele que cree su cuenta primero.",
        )
    if aviso is not None:
        correo_destino, nombre_acudiente, parentesco_etiqueta = aviso
        background_tasks.add_task(
            enviar_correo_aviso_acudiente, correo_destino, nombre_acudiente, parentesco_etiqueta
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
            detail=(
                "Tu cuenta se bloqueó por demasiados intentos fallidos. Usa "
                "\"¿Olvidaste tu contraseña?\" para crear una nueva y desbloquearla."
            ),
        )
    return TokenResponse(access_token=token, rol=usuario.rol.nombre, usuario_id=usuario.id)


@router.get("/me", response_model=UsuarioActual)
def usuario_actual(usuario: UsuarioActual = Depends(obtener_usuario_actual)):
    return usuario


@router.post("/vincular-estudiante", response_model=MensajeResponse)
def vincular_estudiante(
    datos: VincularEstudianteRequest,
    background_tasks: BackgroundTasks,
    usuario: UsuarioActual = Depends(requerir_rol("ACUDIENTE")),
    db: Session = Depends(get_db),
):
    try:
        correo_destino, nombre_acudiente, parentesco_etiqueta = AuthService(db).vincular_estudiante_adicional(
            usuario.id, datos.correo_estudiante, datos.parentesco
        )
    except EstudianteNoEncontradoError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No encontramos un estudiante registrado con ese correo. Pídele que cree su cuenta primero.",
        )
    except EstudianteYaVinculadoError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya tienes vinculado a ese estudiante.",
        )
    background_tasks.add_task(
        enviar_correo_aviso_acudiente, correo_destino, nombre_acudiente, parentesco_etiqueta
    )
    return MensajeResponse(mensaje="Estudiante vinculado correctamente. Ya puedes autorizarlo.")


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
