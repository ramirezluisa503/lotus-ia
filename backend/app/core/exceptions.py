class CorreoYaRegistradoError(Exception):
    """Ya existe un usuario con ese correo."""


class CredencialesInvalidasError(Exception):
    """Correo o contraseña incorrectos."""


class CuentaBloqueadaError(Exception):
    """La cuenta superó el máximo de intentos fallidos permitidos."""
