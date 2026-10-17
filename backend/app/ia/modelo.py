"""Capa de Inteligencia Artificial (Capítulo 9, sección 9.2.2).

IMPORTANTE: Esta es una implementación PLACEHOLDER basada en reglas simples,
NO el modelo de Machine Learning entrenado y comparado que exige el proyecto
(ver 5.1.5, 9.5.4). Se construyó así para poder completar el resto de la
plataforma (recomendación, oferta académica, encuesta) sin bloquear el
desarrollo mientras se entrena el modelo real.

Para reemplazarla: conserva la firma de `predecir(variables) -> Prediccion`
(es el único punto de contacto con el resto del sistema, vía
RecomendacionService) y carga tu modelo_vX.pkl con joblib aquí dentro.
Ningún otro archivo del backend necesita cambiar.
"""

from dataclasses import dataclass

VERSION_MODELO = "0.1-reglas"

# Mapeo simple dimensión RIASEC -> área de conocimiento (SNIES).
# Un modelo entrenado reemplazaría esto por patrones aprendidos de datos
# reales, no por una tabla fija.
_DIMENSION_A_AREA = {
    "REALISTA": "Ingeniería, arquitectura, urbanismo y afines",
    "INVESTIGADOR": "Matemáticas y ciencias naturales",
    "ARTISTICO": "Bellas artes",
    "SOCIAL": "Ciencias de la educación",
    "EMPRENDEDOR": "Economía, administración, contaduría y afines",
    "CONVENCIONAL": "Ciencias sociales y humanas",
}

_ETIQUETA_DIMENSION = {
    "REALISTA": "actividades prácticas y técnicas",
    "INVESTIGADOR": "análisis e investigación",
    "ARTISTICO": "creatividad y expresión",
    "SOCIAL": "ayudar y enseñar a otros",
    "EMPRENDEDOR": "liderazgo y toma de decisiones",
    "CONVENCIONAL": "organización y manejo de información",
}


@dataclass(frozen=True)
class Prediccion:
    area_nombre: str
    nivel_formacion: str
    probabilidad: float
    explicacion: str
    version_modelo: str = VERSION_MODELO


def _nivel_segun_promedio(promedio_academico: float | None) -> str:
    if promedio_academico is None:
        return "TECNOLOGICO"
    if promedio_academico >= 4.0:
        return "UNIVERSITARIO"
    if promedio_academico >= 3.0:
        return "TECNOLOGICO"
    return "TECNICO_PROFESIONAL"


def predecir(variables: dict) -> Prediccion:
    """Punto único de entrada de la capa de IA.

    `variables` (sin identificadores del estudiante, ver AnonimizacionService):
        {
            "notas": {"Matemáticas": 4.5, ...},
            "puntajes_riasec": {"REALISTA": 7, "INVESTIGADOR": 9, ...},
        }
    """
    puntajes = variables.get("puntajes_riasec") or {}
    notas = variables.get("notas") or {}

    if puntajes:
        dimension_top = max(puntajes, key=puntajes.get)
        total = sum(puntajes.values()) or 1
        probabilidad = round(min(puntajes[dimension_top] / total * len(puntajes) / 2, 0.97), 4)
    else:
        dimension_top = "INVESTIGADOR"
        probabilidad = 0.5

    area_nombre = _DIMENSION_A_AREA.get(dimension_top, "Ciencias sociales y humanas")

    promedio = sum(notas.values()) / len(notas) if notas else None
    nivel = _nivel_segun_promedio(promedio)

    etiqueta = _ETIQUETA_DIMENSION.get(dimension_top, "tus intereses")
    explicacion = (
        f"En el test respondiste con mayor interés hacia {etiqueta}, "
        f"lo que se relaciona con el área de {area_nombre.lower()}."
    )
    if promedio is not None:
        explicacion += f" Tu promedio académico ({promedio:.1f}) orientó el nivel de formación sugerido."

    return Prediccion(
        area_nombre=area_nombre,
        nivel_formacion=nivel,
        probabilidad=probabilidad,
        explicacion=explicacion,
    )
