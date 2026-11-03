from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import obtener_usuario_actual, requerir_rol
from app.core.email import (
    enviar_correo_aviso_acudiente,
    enviar_correo_confirmacion,
    enviar_correo_recuperacion,
)
from app.core.exceptions import (
    CorreoInexistenteError,
    CorreoNoConfirmadoError,
    CorreoYaRegistradoError,
    CredencialesInvalidasError,
    CuentaBloqueadaError,
    DocumentoYaRegistradoError,
    EstudianteNoEncontradoError,
    EstudianteYaVinculadoError,
    TokenConfirmacionInvalidoError,
    TokenRecuperacionInvalidoError,
)
from app.db.session import get_db
from app.schemas.auth import (
    ActualizarPerfilRequest,
    CambiarContrasenaRequest,
    ConfirmarCorreoRequest,
    LoginRequest,
    MensajeResponse,
    OlvideContrasenaRequest,
    ReenviarConfirmacionRequest,
    RegistroRequest,
    RegistroResponse,
    RestablecerContrasenaRequest,
    TokenResponse,
    UsuarioActual,
    ValidarCorreoResponse,
    VincularEstudianteRequest,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.get("/validar-correo", response_model=ValidarCorreoResponse)
def validar_correo(correo: str = Query(min_length=3), db: Session = Depends(get_db)):
    if AuthService(db).validar_correo(correo):
        return ValidarCorreoResponse(valido=True)
    return ValidarCorreoResponse(
        valido=False, mensaje="Ese dominio de correo no existe o no puede recibir correos."
    )


@router.post("/registro", response_model=RegistroResponse, status_code=status.HTTP_201_CREATED)
def registrar(datos: RegistroRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        usuario, aviso, enlace_confirmacion = AuthService(db).registrar(datos)
    except CorreoInexistenteError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ese correo no existe o su dominio no puede recibir correos. Verifícalo e inténtalo de nuevo.",
        )
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
    background_tasks.add_task(enviar_correo_confirmacion, usuario.correo, enlace_confirmacion)
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
    except CorreoNoConfirmadoError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.",
        )
    return TokenResponse(access_token=token, rol=usuario.rol.nombre, usuario_id=usuario.id)


@router.post("/confirmar-correo", response_model=MensajeResponse)
def confirmar_correo(datos: ConfirmarCorreoRequest, db: Session = Depends(get_db)):
    try:
        AuthService(db).confirmar_correo(datos.token)
    except TokenConfirmacionInvalidoError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El enlace de confirmación no es válido o ya expiró. Solicita uno nuevo.",
        )
    return MensajeResponse(mensaje="Tu correo quedó confirmado. Ya puedes iniciar sesión.")


@router.post("/reenviar-confirmacion", response_model=MensajeResponse)
def reenviar_confirmacion(
    datos: ReenviarConfirmacionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    resultado = AuthService(db).reenviar_confirmacion(datos.correo)
    if resultado is not None:
        correo_destino, enlace = resultado
        background_tasks.add_task(enviar_correo_confirmacion, correo_destino, enlace)
    return MensajeResponse(
        mensaje="Si ese correo está registrado y pendiente de confirmar, te enviamos un nuevo enlace."
    )


@router.get("/me", response_model=UsuarioActual)
def usuario_actual(usuario: UsuarioActual = Depends(obtener_usuario_actual)):
    return usuario


@router.put("/perfil", response_model=UsuarioActual)
def actualizar_perfil(
    datos: ActualizarPerfilRequest,
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    try:
        actualizado = AuthService(db).actualizar_perfil(usuario.id, datos.nombre, datos.correo)
    except CorreoYaRegistradoError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe otra cuenta registrada con ese correo.",
        )
    return UsuarioActual(id=actualizado.id, correo=actualizado.correo, nombre=datos.nombre, rol=usuario.rol)


@router.put("/cambiar-contrasena", response_model=MensajeResponse)
def cambiar_contrasena(
    datos: CambiarContrasenaRequest,
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db),
):
    try:
        AuthService(db).cambiar_contrasena(usuario.id, datos.contrasena_actual, datos.nueva_contrasena)
    except CredencialesInvalidasError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tu contraseña actual no es correcta.",
        )
    return MensajeResponse(mensaje="Tu contraseña se actualizó correctamente.")


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
