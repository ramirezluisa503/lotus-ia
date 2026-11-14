"""Capa de Inteligencia Artificial (Capítulo 9, sección 9.2.2).

Modelo real: Árbol de Decisión (scikit-learn) entrenado con datos del
ICFES Saber 11 de Risaralda. Ver backend/ml/README.md para el detalle
completo del entrenamiento, las variables y las métricas.

Esta capa no tiene acceso a la base de datos ni a identificadores del
estudiante: RecomendacionService arma el diccionario `variables` a
partir de los datos ya seudonimizados y esta función solo predice.
"""

import json
from dataclasses import dataclass
from pathlib import Path

import joblib
import pandas as pd

VERSION_MODELO = "1.0-arbol"

_CARPETA = Path(__file__).resolve().parent.parent.parent / "ml"
_modelo = joblib.load(_CARPETA / "modelo_arbol_decision_v1.pkl")
_scaler = joblib.load(_CARPETA / "scaler_v1.pkl")
_config = json.loads((_CARPETA / "preprocesamiento_v1.json").read_text(encoding="utf-8"))

_COD = _config["codificacion"]
_MEDIANAS = _config["valor_si_falta_mediana"]
_ORDEN_VARIABLES = _config["orden_variables"]
_COLUMNAS_SCALER = _config["columnas_scaler_en_orden"]
_SCALER_MIN = dict(zip(_COLUMNAS_SCALER, _config["scaler_min"]))
_SCALER_MAX = dict(zip(_COLUMNAS_SCALER, _config["scaler_max"]))

# El árbol predice 7 categorías propias del dataset de entrenamiento, no las
# 8 áreas SNIES que usa la plataforma. Mapeo acordado con la autora: el
# código 7 ("Técnico y tecnológico general") resultó ser, al revisar
# entrenamiento/paso6_variable_salida.py, el caso en que Ciencias naturales
# fue el área con mayor puntaje pero Matemáticas quedó bajo -> se mapea a
# "Matemáticas y ciencias naturales" en vez de a algo genérico sin relación
# con el perfil académico real del estudiante.
_AREA_SNIES = {
    1: "Ingeniería, arquitectura, urbanismo y afines",
    2: "Ciencias de la salud",
    3: "Ciencias sociales y humanas",
    4: "Bellas artes",
    5: "Economía, administración, contaduría y afines",
    6: "Ciencias de la educación",
    7: "Matemáticas y ciencias naturales",
}

# El dataset de entrenamiento calculaba un "nivel" (paso6_variable_salida.py,
# líneas 73-81) a partir del puntaje socioeconómico normalizado, pero la
# función solo retornaba el área: el nivel nunca llegó al modelo. Se
# reproduce aquí la misma fórmula para no perder esa parte de la lógica.
def _calcular_nivel(fila_escalada: pd.Series) -> str:
    socioeconomico = (
        fila_escalada["fami_estratovivienda"]
        + fila_escalada["fami_tieneinternet"]
        + fila_escalada["fami_tienecomputador"]
        + fila_escalada["fami_educacionpadre"]
        + fila_escalada["fami_educacionmadre"]
    ) / 5
    if socioeconomico <= 0.3:
        return "TECNICO_PROFESIONAL"
    if socioeconomico <= 0.6:
        return "TECNOLOGICO"
    return "UNIVERSITARIO"


_ETIQUETAS = {
    "punt_matematicas": "tu puntaje en Matemáticas",
    "punt_lectura_critica": "tu puntaje en Lectura crítica",
    "punt_c_naturales": "tu puntaje en Ciencias naturales",
    "punt_sociales_ciudadanas": "tu puntaje en Sociales y ciudadanas",
    "punt_ingles": "tu puntaje en Inglés",
    "punt_global": "tu puntaje global del ICFES",
    "fami_estratovivienda": "tu estrato socioeconómico",
    "fami_educacionpadre": "el nivel educativo de tu padre",
    "fami_educacionmadre": "el nivel educativo de tu madre",
    "edad": "tu edad",
}

# Orden de prioridad: primero las variables más fáciles de interpretar para
# un estudiante (puntajes ICFES), luego el contexto socioeconómico.
_PRIORIDAD = [
    "punt_matematicas", "punt_lectura_critica", "punt_c_naturales",
    "punt_sociales_ciudadanas", "punt_ingles", "punt_global",
    "fami_estratovivienda", "fami_educacionpadre", "fami_educacionmadre", "edad",
]


def preprocesar(estudiante: dict) -> pd.DataFrame:
    """Convierte los datos "crudos" de un estudiante (como vienen del ICFES)
    en la fila de 22 columnas que espera el modelo. Idéntico al preprocesar()
    verificado en backend/ml/ejemplo_prediccion.py."""
    e = estudiante
    edu = _COD["fami_educacionpadre_y_madre"]
    fila = {
        "estu_genero": _COD["estu_genero"].get(e.get("estu_genero")),
        "cole_area_ubicacion": _COD["cole_area_ubicacion"].get(e.get("cole_area_ubicacion")),
        "cole_naturaleza": _COD["cole_naturaleza"].get(e.get("cole_naturaleza")),
        "cole_caracter": _COD["cole_caracter"].get(e.get("cole_caracter")),
        "cole_jornada": _COD["cole_jornada"].get(e.get("cole_jornada")),
        "cole_depto_ubicacion": _COD["cole_depto_ubicacion"].get(e.get("cole_depto_ubicacion")),
        "fami_estratovivienda": e.get("fami_estratovivienda"),
        "fami_personashogar": e.get("fami_personashogar"),
        "fami_tieneinternet": _COD["fami_tieneinternet"].get(e.get("fami_tieneinternet")),
        "fami_tienecomputador": _COD["fami_tienecomputador"].get(e.get("fami_tienecomputador")),
        "fami_tienelavadora": _COD["fami_tienelavadora"].get(e.get("fami_tienelavadora")),
        "fami_tieneautomovil": _COD["fami_tieneautomovil"].get(e.get("fami_tieneautomovil")),
        "fami_educacionpadre": edu.get(e.get("fami_educacionpadre")),
        "fami_educacionmadre": edu.get(e.get("fami_educacionmadre")),
        "punt_matematicas": e.get("punt_matematicas"),
        "punt_lectura_critica": e.get("punt_lectura_critica"),
        "punt_c_naturales": e.get("punt_c_naturales"),
        "punt_sociales_ciudadanas": e.get("punt_sociales_ciudadanas"),
        "punt_ingles": e.get("punt_ingles"),
        "punt_global": e.get("punt_global"),
        "desemp_ingles": _COD["desemp_ingles"].get(e.get("desemp_ingles")),
        "edad": e.get("edad"),
    }
    df = pd.DataFrame([fila], columns=_ORDEN_VARIABLES, dtype=float)
    df = df.fillna(_MEDIANAS)  # dato faltante/desconocido -> mediana del entrenamiento
    df[_COLUMNAS_SCALER] = _scaler.transform(df[_COLUMNAS_SCALER])
    return df


def _valor_original(nombre_columna: str, valor_escalado: float) -> float:
    """Invierte la normalización 0-1 para mostrar el valor en su escala real."""
    minimo, maximo = _SCALER_MIN[nombre_columna], _SCALER_MAX[nombre_columna]
    return valor_escalado * (maximo - minimo) + minimo


# Nombre corto de cada variable, para mostrarlo en tarjetas (sin "tu ...").
_NOMBRE_CORTO = {
    "punt_matematicas": "Matemáticas",
    "punt_lectura_critica": "Lectura crítica",
    "punt_c_naturales": "Ciencias naturales",
    "punt_sociales_ciudadanas": "Sociales y ciudadanas",
    "punt_ingles": "Inglés",
    "punt_global": "Puntaje global ICFES",
    "fami_estratovivienda": "Estrato",
    "fami_educacionpadre": "Educación de tu padre",
    "fami_educacionmadre": "Educación de tu madre",
    "edad": "Edad",
}

# Variables cuyo número se entiende tal cual (puntajes, estrato, edad). La
# educación de los padres se guarda como un código interno, así que de esas
# no se muestra el número.
_CON_NUMERO_LEGIBLE = {
    "punt_matematicas", "punt_lectura_critica", "punt_c_naturales",
    "punt_sociales_ciudadanas", "punt_ingles", "punt_global",
    "fami_estratovivienda", "edad",
}


def _razones(X: pd.DataFrame, max_condiciones: int = 3) -> list[dict]:
    """Recorre decision_path del árbol (REQF012) y devuelve las condiciones
    más relevantes para este estudiante, priorizando los puntajes ICFES y
    el contexto socioeconómico por encima de variables administrativas del
    colegio. Cada razón dice en qué variable se fijó el árbol, el valor del
    estudiante, el punto de corte que usó el árbol y de qué lado quedó."""
    camino = _modelo.decision_path(X)
    nodos = camino.indices[camino.indptr[0]:camino.indptr[1]]
    feature_idx = _modelo.tree_.feature
    threshold = _modelo.tree_.threshold

    vistos = set()
    condiciones = []
    for nodo in nodos:
        idx = feature_idx[nodo]
        if idx == -2:  # hoja, no es una condición
            continue
        nombre_col = _ORDEN_VARIABLES[idx]
        if nombre_col not in _ETIQUETAS or nombre_col in vistos:
            continue  # cada variable aparece una sola vez (el árbol puede repetirla en el camino)
        vistos.add(nombre_col)
        valor_escalado = X.iloc[0, idx]
        va_bajo = bool(valor_escalado <= threshold[nodo])
        valor_real = _valor_original(nombre_col, valor_escalado)
        referencia_real = _valor_original(nombre_col, threshold[nodo])
        legible = nombre_col in _CON_NUMERO_LEGIBLE
        condiciones.append({
            "variable": nombre_col,
            "nombre": _NOMBRE_CORTO[nombre_col],
            "etiqueta": _ETIQUETAS[nombre_col],
            "valor": round(float(valor_real), 1) if legible else None,
            "referencia": round(float(referencia_real), 1) if legible else None,
            "direccion": "por_debajo" if va_bajo else "por_encima",
        })

    condiciones.sort(key=lambda c: _PRIORIDAD.index(c["variable"]) if c["variable"] in _PRIORIDAD else 99)
    return condiciones[:max_condiciones]


def _generar_explicacion(razones: list[dict]) -> str:
    """Arma una frase en lenguaje sencillo a partir de las razones."""
    if not razones:
        return "La recomendación se basó en tu perfil académico y socioeconómico completo."

    frases = []
    for r in razones:
        calificativo = "relativamente bajo" if r["direccion"] == "por_debajo" else "destacado"
        valor_txt = f" ({r['valor']:.0f})" if r["valor"] is not None else ""
        frases.append(f"{r['etiqueta']}{valor_txt}, {calificativo} frente al resto de tu perfil")

    return "Esta recomendación se basó principalmente en " + "; ".join(frases) + "."


@dataclass(frozen=True)
class Prediccion:
    area_nombre: str
    nivel_formacion: str
    probabilidad: float | None
    explicacion: str
    razones: tuple = ()
    version_modelo: str = VERSION_MODELO


def predecir(variables: dict) -> Prediccion:
    """Punto único de entrada de la capa de IA. `variables` es un
    diccionario con los valores "crudos" del estudiante (ver
    backend/ml/README.md para el formato exacto de cada campo)."""
    X = preprocesar(variables)

    codigo = int(_modelo.predict(X)[0])
    area_nombre = _AREA_SNIES.get(codigo, "Ciencias sociales y humanas")
    nivel = _calcular_nivel(X.iloc[0])
    razones = _razones(X)
    explicacion = _generar_explicacion(razones)

    # predict_proba siempre da 1.0 en este árbol (hojas puras): no es una
    # medida de confianza real, así que no se reporta (ver README).
    return Prediccion(
        area_nombre=area_nombre,
        nivel_formacion=nivel,
        probabilidad=None,
        explicacion=explicacion,
        razones=tuple(razones),
    )
