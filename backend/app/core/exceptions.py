class CorreoYaRegistradoError(Exception):
    """Ya existe un usuario con ese correo."""


class CredencialesInvalidasError(Exception):
    """Correo o contraseña incorrectos."""


class CuentaBloqueadaError(Exception):
    """La cuenta superó el máximo de intentos fallidos permitidos."""


class TokenRecuperacionInvalidoError(Exception):
    """El token de recuperación de contraseña es inválido, ya se usó o expiró."""


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


class DatosInsuficientesError(Exception):
    """Falta completar el cuestionario antes de generar una recomendación."""


class ModeloNoDisponibleError(Exception):
    """No hay ningún modelo de IA activo configurado."""


class RecomendacionNoEncontradaError(Exception):
    """La recomendación no existe o no pertenece a este estudiante."""


class RecomendacionYaCalificadaError(Exception):
    """Ya existe una encuesta de satisfacción para esta recomendación."""


class RecursoNoEncontradoError(Exception):
    """Entidad administrable (institución, carrera, beca, modelo) no encontrada."""
