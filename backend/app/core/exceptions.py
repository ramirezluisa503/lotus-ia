class CorreoYaRegistradoError(Exception):
    """Ya existe un usuario con ese correo."""


class CredencialesInvalidasError(Exception):
    """Correo o contraseña incorrectos."""


class CuentaBloqueadaError(Exception):
    """La cuenta superó el máximo de intentos fallidos permitidos."""


class EstudianteNoEncontradoError(Exception):
    """No existe un usuario con rol ESTUDIANTE registrado con ese correo."""


class AutorizacionIncompletaError(Exception):
    """Falta el consentimiento del acudiente o el asentimiento del estudiante."""


class EstudianteNoVinculadoError(Exception):
    """El acudiente no tiene ningún estudiante vinculado todavía."""


class AreaAcademicaInvalidaError(Exception):
    """El nombre de área académica enviado no existe en el catálogo."""


class InstrumentoNoDisponibleError(Exception):
    """No hay ningún instrumento psicométrico activo configurado."""
