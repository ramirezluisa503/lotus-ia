from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import obtener_usuario_actual
from app.core.exceptions import (
    CorreoYaRegistradoError,
    CredencialesInvalidasError,
    CuentaBloqueadaError,
    EstudianteNoEncontradoError,
)
from app.db.session import get_db
from app.schemas.auth import (
    LoginRequest,
    RegistroRequest,
    RegistroResponse,
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
