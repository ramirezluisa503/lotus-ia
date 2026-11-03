import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.core.config import get_settings
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
from app.core.security import (
    TOKEN_CONFIRMACION_HORAS,
    TOKEN_RECUPERACION_MINUTOS,
    cifrar_texto,
    correo_existe,
    crear_token,
    descifrar_texto,
    generar_token_seguro,
    hashear_contrasena,
    hashear_documento,
    hashear_token,
    verificar_contrasena,
)
from app.models.estudiante import Estudiante
from app.models.usuario import Usuario
from app.repositories.estudiante_repository import EstudianteRepository
from app.repositories.rol_repository import RolRepository
from app.repositories.token_confirmacion_repository import TokenConfirmacionRepository
from app.repositories.token_recuperacion_repository import TokenRecuperacionRepository
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
        self.tokens_recuperacion = TokenRecuperacionRepository(db)
        self.tokens_confirmacion = TokenConfirmacionRepository(db)

    def registrar(
        self, datos: RegistroRequest
    ) -> tuple[Usuario, tuple[str, str, str] | None, str]:
        """Devuelve (usuario_creado, aviso_correo, enlace_confirmacion).
        aviso_correo es (correo_destino, nombre_acudiente, etiqueta_parentesco)
        cuando se registró un acudiente -- quien llame programa el envío del
        correo de aviso al estudiante; o None si se registró un estudiante.
        enlace_confirmacion siempre se devuelve: quien llame debe enviarlo
        por correo para que el usuario pueda confirmar su cuenta."""
        if not correo_existe(datos.correo):
            raise CorreoInexistenteError()

        if self.usuarios.obtener_por_correo(datos.correo) is not None:
            raise CorreoYaRegistradoError()

        documento_hash = hashear_documento(datos.documento)
        if self.usuarios.obtener_por_documento_hash(documento_hash) is not None:
            raise DocumentoYaRegistradoError()

        estudiante_usuario = None
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
            documento_cifrado=cifrar_texto(datos.documento),
            documento_hash=documento_hash,
            fecha_nacimiento=datos.fecha_nacimiento,
            acepta_declaracion_legal=datos.acepta_declaracion_legal,
            correo_confirmado=False,
            rol_id=rol.id,
        )
        self.db.add(usuario)
        self.db.flush()  # asigna usuario.id sin cerrar la transacción

        aviso_correo = None
        if datos.rol == "ESTUDIANTE":
            estudiante = self.estudiantes.crear(Estudiante(grado=datos.grado))
            self.estudiantes.vincular_usuario(usuario.id, estudiante.id)
        else:  # ACUDIENTE
            aviso_correo = self._vincular_estudiante(
                usuario.id, datos.nombre, estudiante_usuario, datos.parentesco
            )

        token = generar_token_seguro()
        expira_en = datetime.now(timezone.utc) + timedelta(hours=TOKEN_CONFIRMACION_HORAS)
        self.tokens_confirmacion.crear(usuario.id, hashear_token(token), expira_en)

        self.db.commit()
        self.db.refresh(usuario)

        settings = get_settings()
        enlace_confirmacion = f"{settings.frontend_url}/confirmar-correo?token={token}"
        return usuario, aviso_correo, enlace_confirmacion

    def _vincular_estudiante(
        self,
        acudiente_usuario_id: uuid.UUID,
        nombre_acudiente: str,
        estudiante_usuario: Usuario,
        parentesco: str,
    ) -> tuple[str, str, str]:
        """Crea el vínculo y la notificación; no hace commit (lo hace quien
        llame). Devuelve (correo_destino, nombre_acudiente, etiqueta) para
        que el controlador programe el correo de aviso."""
        self.vinculos.crear(
            acudiente_id=acudiente_usuario_id,
            estudiante_usuario_id=estudiante_usuario.id,
            parentesco=parentesco,
        )
        etiqueta = _PARENTESCO_ETIQUETA.get(parentesco, "Un acudiente")
        crear_notificacion(
            self.db,
            estudiante_usuario.id,
            "ACUDIENTE_REGISTRADO",
            f"{etiqueta} se registró en Lotus.IA y debe autorizar tu participación.",
            "/autorizacion",
        )
        return estudiante_usuario.correo, nombre_acudiente, etiqueta

    def vincular_estudiante_adicional(
        self, acudiente_usuario_id: uuid.UUID, correo_estudiante: str, parentesco: str
    ) -> tuple[str, str, str]:
        """Para un acudiente ya registrado que agrega otro estudiante a su
        cargo (p. ej. un segundo hijo) sin crear una cuenta nueva."""
        estudiante_usuario = self.usuarios.obtener_por_correo(correo_estudiante)
        if estudiante_usuario is None or estudiante_usuario.rol.nombre != "ESTUDIANTE":
            raise EstudianteNoEncontradoError()

        if self.vinculos.existe_vinculo(acudiente_usuario_id, estudiante_usuario.id):
            raise EstudianteYaVinculadoError()

        acudiente = self.usuarios.obtener_por_id(acudiente_usuario_id)
        nombre_acudiente = descifrar_texto(acudiente.nombre_cifrado)

        aviso_correo = self._vincular_estudiante(
            acudiente_usuario_id, nombre_acudiente, estudiante_usuario, parentesco
        )
        self.db.commit()
        return aviso_correo

    def actualizar_perfil(self, usuario_id: uuid.UUID, nombre: str, correo: str) -> Usuario:
        usuario = self.usuarios.obtener_por_id(usuario_id)
        if correo != usuario.correo:
            existente = self.usuarios.obtener_por_correo(correo)
            if existente is not None and existente.id != usuario.id:
                raise CorreoYaRegistradoError()
            usuario.correo = correo
        usuario.nombre_cifrado = cifrar_texto(nombre)
        self.db.commit()
        self.db.refresh(usuario)
        return usuario

    def cambiar_contrasena(
        self, usuario_id: uuid.UUID, contrasena_actual: str, nueva_contrasena: str
    ) -> None:
        usuario = self.usuarios.obtener_por_id(usuario_id)
        if not verificar_contrasena(contrasena_actual, usuario.contrasena_hash):
            raise CredencialesInvalidasError()
        usuario.contrasena_hash = hashear_contrasena(nueva_contrasena)
        self.db.commit()

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

        if not usuario.correo_confirmado:
            raise CorreoNoConfirmadoError()

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

        token = generar_token_seguro()
        expira_en = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_RECUPERACION_MINUTOS)
        self.tokens_recuperacion.crear(usuario.id, hashear_token(token), expira_en)
        self.db.commit()

        settings = get_settings()
        enlace = f"{settings.frontend_url}/restablecer-contrasena?token={token}"
        return usuario.correo, enlace

    def restablecer_contrasena(self, token: str, nueva_contrasena: str) -> None:
        registro = self.tokens_recuperacion.obtener_vigente(hashear_token(token))
        if registro is None or registro.expira_en < datetime.now(timezone.utc):
            raise TokenRecuperacionInvalidoError()

        usuario = self.usuarios.obtener_por_id(registro.usuario_id)
        if usuario is None:
            raise TokenRecuperacionInvalidoError()

        registro.usado = True
        usuario.contrasena_hash = hashear_contrasena(nueva_contrasena)
        usuario.intentos_fallidos = 0
        self.db.commit()

    def validar_correo(self, correo: str) -> bool:
        return correo_existe(correo)

    def confirmar_correo(self, token: str) -> None:
        registro = self.tokens_confirmacion.obtener_vigente(hashear_token(token))
        if registro is None or registro.expira_en < datetime.now(timezone.utc):
            raise TokenConfirmacionInvalidoError()

        usuario = self.usuarios.obtener_por_id(registro.usuario_id)
        if usuario is None:
            raise TokenConfirmacionInvalidoError()

        registro.usado = True
        usuario.correo_confirmado = True
        self.db.commit()

    def reenviar_confirmacion(self, correo: str) -> tuple[str, str] | None:
        """Igual que solicitar_recuperacion: devuelve (correo_destino, enlace)
        o None, sin revelar por qué, para no filtrar qué correos existen."""
        usuario = self.usuarios.obtener_por_correo(correo)
        if usuario is None or not usuario.activo or usuario.correo_confirmado:
            return None

        token = generar_token_seguro()
        expira_en = datetime.now(timezone.utc) + timedelta(hours=TOKEN_CONFIRMACION_HORAS)
        self.tokens_confirmacion.crear(usuario.id, hashear_token(token), expira_en)
        self.db.commit()

        settings = get_settings()
        enlace = f"{settings.frontend_url}/confirmar-correo?token={token}"
        return usuario.correo, enlace
