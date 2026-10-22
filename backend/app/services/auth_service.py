import uuid

import jwt
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import (
    CorreoYaRegistradoError,
    CredencialesInvalidasError,
    CuentaBloqueadaError,
    EstudianteNoEncontradoError,
    TokenRecuperacionInvalidoError,
)
from app.core.security import (
    cifrar_texto,
    crear_token,
    crear_token_recuperacion,
    decodificar_token_recuperacion,
    hashear_contrasena,
    verificar_contrasena,
)
from app.models.estudiante import Estudiante
from app.models.usuario import Usuario
from app.repositories.estudiante_repository import EstudianteRepository
from app.repositories.rol_repository import RolRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.vinculo_acudiente_repository import VinculoAcudienteRepository
from app.schemas.auth import LoginRequest, RegistroRequest
from app.services.notificacion_service import crear_notificacion

MAX_INTENTOS_FALLIDOS = 5

_PARENTESCO_ETIQUETA = {"MADRE": "Tu madre", "PADRE": "Tu padre", "TUTOR_LEGAL": "Tu tutor legal"}


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.usuarios = UsuarioRepository(db)
        self.roles = RolRepository(db)
        self.estudiantes = EstudianteRepository(db)
        self.vinculos = VinculoAcudienteRepository(db)

    def registrar(self, datos: RegistroRequest) -> Usuario:
        if self.usuarios.obtener_por_correo(datos.correo) is not None:
            raise CorreoYaRegistradoError()

        if datos.rol == "ACUDIENTE":
            estudiante_usuario = self.usuarios.obtener_por_correo(datos.correo_estudiante)
            if estudiante_usuario is None or estudiante_usuario.rol.nombre != "ESTUDIANTE":
                raise EstudianteNoEncontradoError()

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
        self.db.add(usuario)
        self.db.flush()  # asigna usuario.id sin cerrar la transacción

        if datos.rol == "ESTUDIANTE":
            estudiante = self.estudiantes.crear(Estudiante(grado=datos.grado))
            self.estudiantes.vincular_usuario(usuario.id, estudiante.id)
        else:  # ACUDIENTE
            self.vinculos.crear(
                acudiente_id=usuario.id,
                estudiante_usuario_id=estudiante_usuario.id,
                parentesco=datos.parentesco,
            )
            etiqueta = _PARENTESCO_ETIQUETA.get(datos.parentesco, "Un acudiente")
            crear_notificacion(
                self.db,
                estudiante_usuario.id,
                "ACUDIENTE_REGISTRADO",
                f"{etiqueta} se registró en Lotus.IA y debe autorizar tu participación.",
                "/autorizacion",
            )

        self.db.commit()
        self.db.refresh(usuario)
        return usuario

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

    def solicitar_recuperacion(self, correo: str) -> tuple[str, str] | None:
        """Devuelve (correo_destino, enlace) si existe una cuenta activa con
        ese correo, o None si no -- quien llame no debe revelar cuál fue el
        caso para no filtrar qué correos están registrados."""
        usuario = self.usuarios.obtener_por_correo(correo)
        if usuario is None or not usuario.activo:
            return None

        token = crear_token_recuperacion(str(usuario.id))
        settings = get_settings()
        enlace = f"{settings.frontend_url}/restablecer-contrasena?token={token}"
        return usuario.correo, enlace

    def restablecer_contrasena(self, token: str, nueva_contrasena: str) -> None:
        try:
            usuario_id = decodificar_token_recuperacion(token)
        except jwt.PyJWTError:
            raise TokenRecuperacionInvalidoError()

        usuario = self.usuarios.obtener_por_id(uuid.UUID(usuario_id))
        if usuario is None:
            raise TokenRecuperacionInvalidoError()

        usuario.contrasena_hash = hashear_contrasena(nueva_contrasena)
        usuario.intentos_fallidos = 0
        self.usuarios.guardar(usuario)
