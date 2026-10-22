import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from cryptography.fernet import Fernet

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


# ---------- Recuperación de contraseña ----------
# Token aleatorio de un solo uso, guardado en auth.tokens_recuperacion
# (Capítulo 9) -- nunca se guarda el token en texto plano, solo su hash,
# igual que con las contraseñas.

TOKEN_RECUPERACION_MINUTOS = 30


def generar_token_recuperacion() -> str:
    return secrets.token_urlsafe(32)


def hashear_token_recuperacion(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
