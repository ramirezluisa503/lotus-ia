# Ejemplo de referencia: cómo preparar los datos de un estudiante y predecir
# con el Árbol de Decisión, aplicando EXACTAMENTE la misma transformación
# que se usó en el entrenamiento (pasos 3, 4 y 5).
import json
from pathlib import Path

import joblib
import pandas as pd

CARPETA = Path(__file__).parent
modelo = joblib.load(CARPETA / 'modelo_arbol_decision_v1.pkl')
scaler = joblib.load(CARPETA / 'scaler_v1.pkl')
config = json.loads((CARPETA / 'preprocesamiento_v1.json').read_text(encoding='utf-8'))

COD = config['codificacion']
MEDIANAS = config['valor_si_falta_mediana']
AREAS = config['salida']['areas']


def preprocesar(estudiante: dict) -> pd.DataFrame:
    """Convierte los datos "crudos" de un estudiante (como vienen del ICFES)
    en la fila de 22 columnas que espera el modelo."""
    e = estudiante
    edu = COD['fami_educacionpadre_y_madre']
    fila = {
        'estu_genero': COD['estu_genero'].get(e.get('estu_genero')),
        'cole_area_ubicacion': COD['cole_area_ubicacion'].get(e.get('cole_area_ubicacion')),
        'cole_naturaleza': COD['cole_naturaleza'].get(e.get('cole_naturaleza')),
        'cole_caracter': COD['cole_caracter'].get(e.get('cole_caracter')),
        'cole_jornada': COD['cole_jornada'].get(e.get('cole_jornada')),
        'cole_depto_ubicacion': COD['cole_depto_ubicacion'].get(e.get('cole_depto_ubicacion')),
        'fami_estratovivienda': e.get('fami_estratovivienda'),
        'fami_personashogar': e.get('fami_personashogar'),
        'fami_tieneinternet': COD['fami_tieneinternet'].get(e.get('fami_tieneinternet')),
        'fami_tienecomputador': COD['fami_tienecomputador'].get(e.get('fami_tienecomputador')),
        'fami_tienelavadora': COD['fami_tienelavadora'].get(e.get('fami_tienelavadora')),
        'fami_tieneautomovil': COD['fami_tieneautomovil'].get(e.get('fami_tieneautomovil')),
        'fami_educacionpadre': edu.get(e.get('fami_educacionpadre')),
        'fami_educacionmadre': edu.get(e.get('fami_educacionmadre')),
        'punt_matematicas': e.get('punt_matematicas'),
        'punt_lectura_critica': e.get('punt_lectura_critica'),
        'punt_c_naturales': e.get('punt_c_naturales'),
        'punt_sociales_ciudadanas': e.get('punt_sociales_ciudadanas'),
        'punt_ingles': e.get('punt_ingles'),
        'punt_global': e.get('punt_global'),
        'desemp_ingles': COD['desemp_ingles'].get(e.get('desemp_ingles')),
        'edad': e.get('edad'),
    }
    df = pd.DataFrame([fila], columns=config['orden_variables'], dtype=float)

    # Datos faltantes o desconocidos -> mediana del entrenamiento (paso 4.11)
    df = df.fillna(MEDIANAS)

    # Normalización 0-1 con el mismo scaler del entrenamiento (paso 5)
    cols = config['columnas_scaler_en_orden']
    df[cols] = scaler.transform(df[cols])
    return df


def predecir(estudiante: dict) -> dict:
    X = preprocesar(estudiante)
    codigo = int(modelo.predict(X)[0])
    probabilidad = float(modelo.predict_proba(X)[0].max())
    return {'codigo_area': codigo, 'area': AREAS[str(codigo)], 'probabilidad': probabilidad}


if __name__ == '__main__':
    ejemplo = {
        'estu_genero': 'F', 'edad': 17,
        'cole_area_ubicacion': 'URBANO', 'cole_naturaleza': 'OFICIAL',
        'cole_caracter': 'ACADÉMICO', 'cole_jornada': 'MAÑANA',
        'cole_depto_ubicacion': 'RISARALDA',
        'fami_estratovivienda': 2, 'fami_personashogar': 4,
        'fami_tieneinternet': 'Si', 'fami_tienecomputador': 'Si',
        'fami_tienelavadora': 'Si', 'fami_tieneautomovil': 'No',
        'fami_educacionpadre': 'Secundaria (Bachillerato) completa',
        'fami_educacionmadre': 'Técnica o tecnológica completa',
        'punt_matematicas': 72, 'punt_lectura_critica': 60,
        'punt_c_naturales': 65, 'punt_sociales_ciudadanas': 58,
        'punt_ingles': 55, 'punt_global': 310, 'desemp_ingles': 'A2',
    }
    print(predecir(ejemplo))
