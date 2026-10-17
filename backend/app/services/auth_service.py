from sqlalchemy.orm import Session

from app.core.exceptions import (
    CorreoYaRegistradoError,
    CredencialesInvalidasError,
    CuentaBloqueadaError,
)
from app.core.security import (
    cifrar_texto,
    crear_token,
    hashear_contrasena,
    verificar_contrasena,
)
from app.models.usuario import Usuario
from app.repositories.rol_repository import RolRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.schemas.auth import LoginRequest, RegistroRequest

MAX_INTENTOS_FALLIDOS = 5


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.usuarios = UsuarioRepository(db)
        self.roles = RolRepository(db)

    def registrar(self, datos: RegistroRequest) -> Usuario:
        if self.usuarios.obtener_por_correo(datos.correo) is not None:
            raise CorreoYaRegistradoError()

        rol = self.roles.obtener_por_nombre(datos.rol)
        if rol is None:
            raise ValueError(f"Rol '{datos.rol}' no existe en la base de datos")

        usuario = Usuario(
            correo=datos.correo,
            contrasena_hash=hashear_contrasena(datos.contrasena),
            nombre_cifrado=cifrar_texto(datos.nombre),
            documento_cifrado=cifrar_texto(datos.documento) if datos.documento else None,
            rol_id=rol.id,
        )
        return self.usuarios.crear(usuario)

    def login(self, datos: LoginRequest) -> tuple[str, Usuario]:
        usuario = self.usuarios.obtener_por_correo(datos.correo)
        if usuario is None or not usuario.activo:
            raise CredencialesInvalidasError()

        if usuario.intentos_fallidos >= MAX_INTENTOS_FALLIDOS:
            raise CuentaBloqueadaError()

        if not verificar_contrasena(datos.contrasena, usuario.contrasena_hash):
            usuario.intentos_fallidos += 1
            self.usuarios.guardar(usuario)
            raise CredencialesInvalidasError()

        usuario.intentos_fallidos = 0
        self.usuarios.guardar(usuario)

        token = crear_token(usuario_id=str(usuario.id), rol=usuario.rol.nombre)
        return token, usuario
