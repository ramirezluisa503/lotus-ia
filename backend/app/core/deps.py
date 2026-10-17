import uuid

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.security import decodificar_token
from app.db.session import get_db
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.auth import UsuarioActual

_bearer_scheme = HTTPBearer(auto_error=False)

_SESION_INVALIDA = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Tu sesión terminó. Vuelve a iniciar sesión.",
)


def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> UsuarioActual:
    if credenciales is None:
        raise _SESION_INVALIDA

    try:
        payload = decodificar_token(credenciales.credentials)
    except jwt.PyJWTError:
        raise _SESION_INVALIDA

    usuario_id = payload.get("sub")
    rol = payload.get("rol")
    if usuario_id is None or rol is None:
        raise _SESION_INVALIDA

    usuario = UsuarioRepository(db).obtener_por_id(uuid.UUID(usuario_id))
    if usuario is None or not usuario.activo:
        raise _SESION_INVALIDA

    return UsuarioActual(id=usuario.id, correo=usuario.correo, rol=rol)


def requerir_rol(*roles_permitidos: str):
    """Dependencia para restringir una ruta a ciertos roles (REQNF003)."""

    def _verificar(usuario: UsuarioActual = Depends(obtener_usuario_actual)) -> UsuarioActual:
        if usuario.rol not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes acceso a esta sección.",
            )
        return usuario

    return _verificar
