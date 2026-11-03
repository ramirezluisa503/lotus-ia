import re

# El ICFES ha rediseñado el "Informe/Reporte de Resultados Individual" Saber 11
# varias veces a lo largo de los años; cada función de abajo sabe leer un
# diseño conocido. Si ninguna reconoce el texto, el llamador debe pedirle al
# estudiante que llene los datos a mano -- nunca se inventa un valor.
#
# Los patrones dejan un número OPCIONAL entre cada palabra de la etiqueta
# (no solo al final) porque cuando una etiqueta de dos palabras ("Sociales Y
# Ciudadanas") se parte en dos líneas dentro de una celda de tabla, la
# extracción de texto de pdfplumber intercala el número EN MEDIO de las dos
# líneas en vez de dejarlo al final (comprobado con PDF reales del ICFES).

_NUM = r"\s*(\d{1,3})?\s*"

_AREAS = {
    "Lectura crítica": r"LECTURA" + _NUM + r"CR[IÍ]TICA" + _NUM,
    "Matemáticas": r"MATEM[ÁA]TICAS" + _NUM,
    "Sociales y ciudadanas": r"SOCIALES" + _NUM + r"Y" + _NUM + r"CIUDADANAS" + _NUM,
    "Ciencias naturales": r"CIENCIAS" + _NUM + r"NATURALES" + _NUM,
}

_NIVELES_INGLES = r"(A-|A1|A2|B1|B\+)"


def _buscar_puntaje(texto: str, patron_etiqueta: str) -> int | None:
    """Busca la etiqueta y toma el primer número capturado (puede haber
    varios grupos opcionales, uno por cada hueco entre palabras de la
    etiqueta; solo uno de ellos tendrá valor)."""
    coincidencia = re.search(patron_etiqueta, texto, re.IGNORECASE)
    if coincidencia is None:
        return None
    grupos = [g for g in coincidencia.groups() if g is not None]
    if not grupos:
        return None
    valor = int(grupos[0])
    return valor if 0 <= valor <= 100 else None


def _extraer_notas_comunes(texto: str) -> dict[str, int] | None:
    notas = {}
    for area, patron in _AREAS.items():
        valor = _buscar_puntaje(texto, patron)
        if valor is None:
            return None
        notas[area] = valor
    return notas


def _extraer_informe_2015(texto: str) -> dict | None:
    """'INFORME INDIVIDUAL DE RESULTADOS SABER 11°': antes de la página de
    resultados trae varias páginas explicando el informe, que mencionan los
    nombres de las pruebas junto a otros números (p. ej. las ponderaciones:
    "Lectura crítica 3, Matemáticas 3..."); hay que ignorar esas páginas y
    leer solo a partir de la tabla real de resultados. El puntaje y nivel de
    inglés vienen juntos en esa tabla, p. ej. "INGLÉS 50 A1 D06 ..."."""
    ancla = re.search(r"Prueba\s+Puntaje\s+Nivel\s+Decil", texto, re.IGNORECASE)
    if ancla is None:
        return None
    texto_resultados = texto[ancla.end():]

    notas = _extraer_notas_comunes(texto_resultados)
    if notas is None:
        return None

    coincidencia = re.search(
        r"INGL[ÉE]S\s+(\d{1,3})\s+" + _NIVELES_INGLES, texto_resultados, re.IGNORECASE
    )
    if coincidencia is None:
        return None
    puntaje_ingles = int(coincidencia.group(1))
    if not (0 <= puntaje_ingles <= 100):
        return None

    notas["Inglés"] = puntaje_ingles
    return {"notas": notas, "desempeno_ingles": coincidencia.group(2).upper()}


def _extraer_reporte_2016(texto: str) -> dict | None:
    """'REPORTE DE RESULTADOS INDIVIDUAL · SABER 11 ·': el puntaje de inglés
    está en la tabla de resultados ("Inglés 66 ...") y el nivel aparece más
    adelante, en la tabla de niveles de desempeño ("Inglés A2")."""
    notas = _extraer_notas_comunes(texto)
    if notas is None:
        return None

    puntaje_ingles = _buscar_puntaje(texto, r"INGL[ÉE]S" + _NUM)
    if puntaje_ingles is None:
        return None
    notas["Inglés"] = puntaje_ingles

    coincidencia = re.search(r"INGL[ÉE]S\s+" + _NIVELES_INGLES + r"\b", texto, re.IGNORECASE)
    if coincidencia is None:
        return None

    return {"notas": notas, "desempeno_ingles": coincidencia.group(1).upper()}


_FORMATOS = [
    (r"INFORME\s+INDIVIDUAL\s+DE\s+RESULTADOS", _extraer_informe_2015),
    (r"REPORTE\s+DE\s+RESULTADOS", _extraer_reporte_2016),
]


def extraer_resultados_icfes(texto: str) -> dict | None:
    """Devuelve {"notas": {area: puntaje}, "desempeno_ingles": nivel} si el
    texto corresponde a un formato conocido del reporte del ICFES y se
    pudieron leer las 5 materias y el nivel de inglés; None en cualquier
    otro caso (formato no reconocido o datos incompletos/inválidos)."""
    for patron_firma, extraer in _FORMATOS:
        if re.search(patron_firma, texto, re.IGNORECASE):
            return extraer(texto)
    return None
