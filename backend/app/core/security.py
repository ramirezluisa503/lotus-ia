import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from cryptography.fernet import Fernet
from email_validator import EmailNotValidError, validate_email

from app.core.config import get_settings

settings = get_settings()


# ---------- Contraseñas (bcrypt) ----------

def hashear_contrasena(contrasena: str) -> str:
    return bcrypt.hashpw(contrasena.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar_contrasena(contrasena: str, contrasena_hash: str) -> bool:
    return bcrypt.checkpw(contrasena.encode("utf-8"), contrasena_hash.encode("utf-8"))


# ---------- Cifrado de identificadores (Fernet) ----------
# nombre_cifrado / documento_cifrado se guardan cifrados, nunca en texto plano.

def _fernet() -> Fernet:
    if not settings.fernet_key:
        raise RuntimeError(
            "FERNET_KEY no está configurada. Genérala con: "
            "python -c \"from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())\""
        )
    return Fernet(settings.fernet_key.encode("utf-8"))


def cifrar_texto(texto: str) -> bytes:
    return _fernet().encrypt(texto.encode("utf-8"))


def descifrar_texto(valor_cifrado: bytes) -> str:
    return _fernet().decrypt(bytes(valor_cifrado)).decode("utf-8")


# ---------- Documento de identidad ----------
# Nunca se compara en texto plano ni cifrado (Fernet no es determinista):
# se guarda también un hash para poder detectar el mismo documento
# registrado dos veces (p. ej. un estudiante usando su propia cédula para
# registrarse como su propio acudiente).

def hashear_documento(documento: str) -> str:
    solo_digitos = "".join(c for c in documento if c.isdigit())
    return hashlib.sha256(solo_digitos.encode("utf-8")).hexdigest()


# ---------- JWT ----------

def crear_token(usuario_id: str, rol: str) -> str:
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": usuario_id,
        "rol": rol,
        "iat": ahora,
        "exp": ahora + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def decodificar_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])


# ---------- Tokens aleatorios de un solo uso ----------
# Usados tanto para recuperar contraseña como para confirmar el correo al
# registrarse -- nunca se guarda el token en texto plano, solo su hash,
# igual que con las contraseñas.

TOKEN_RECUPERACION_MINUTOS = 30
TOKEN_CONFIRMACION_HORAS = 48


def generar_token_seguro() -> str:
    return secrets.token_urlsafe(32)


def hashear_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


# ---------- Validación de correo ----------
# Además del formato (EmailStr), revisa que el dominio tenga servidores de
# correo reales (registro MX, o A/AAAA como respaldo) para bloquear
# correos inventados en dominios que no existen.

def correo_existe(correo: str) -> bool:
    try:
        validate_email(correo, check_deliverability=True)
        return True
    except EmailNotValidError:
        return False
