# PASO 6 — Crear la variable de salida (area_recomendada)
import pandas as pd
import numpy as np

# Cargar el dataset final
df = pd.read_csv('dataset_final.csv')
print("Dataset cargado correctamente")
print(f"Filas: {df.shape[0]} | Columnas: {df.shape[1]}")

# ============================================================
# FUNCIÓN QUE ASIGNA EL ÁREA SEGÚN EL PERFIL ACADÉMICO
# ============================================================
def asignar_area(fila):

    # Puntajes académicos
    mat = fila['punt_matematicas']
    nat = fila['punt_c_naturales']
    lec = fila['punt_lectura_critica']
    soc = fila['punt_sociales_ciudadanas']
    ing = fila['punt_ingles']
    caracter = fila['cole_caracter']

    # Variables socioeconómicas
    estrato = fila['fami_estratovivienda']
    internet = fila['fami_tieneinternet']
    computador = fila['fami_tienecomputador']
    edu_padre = fila['fami_educacionpadre']
    edu_madre = fila['fami_educacionmadre']

    # Calcular puntaje socioeconómico (0 a 1)
    socioeconomico = (estrato + internet + computador + 
                      edu_padre + edu_madre) / 5

    # PASO 1 — Determinar el área según puntajes
    puntajes = {
        'matematicas': mat,
        'naturales': nat,
        'lectura': lec,
        'sociales': soc,
        'ingles': ing
    }
    area_dominante = max(puntajes, key=puntajes.get)

    # Asignar área base
    if area_dominante == 'naturales' and mat >= 0.35:
        area = 2  # Ciencias de la salud

    elif area_dominante == 'matematicas' and caracter >= 1:
        area = 1  # Ciencias exactas e ingeniería — colegio técnico

    elif area_dominante == 'matematicas' and ing >= 0.35:
        area = 5  # Ciencias económicas y administrativas

    elif area_dominante == 'matematicas':
        area = 1  # Ciencias exactas e ingeniería

    elif area_dominante == 'lectura' and soc >= 0.35:
        area = 3  # Ciencias sociales y humanas

    elif area_dominante == 'lectura':
        area = 4  # Artes y diseño

    elif area_dominante == 'sociales' and ing >= 0.35:
        area = 5  # Ciencias económicas y administrativas

    elif area_dominante == 'sociales':
        area = 6  # Educación

    else:
        area = 7  # Técnico y tecnológico general

    # PASO 2 — Ajustar según contexto socioeconómico
    if socioeconomico <= 0.3:
        # Estrato bajo — recomendar nivel técnico
        nivel = 'Técnico'
    elif socioeconomico <= 0.6:
        # Estrato medio — recomendar tecnológico
        nivel = 'Tecnológico'
    else:
        # Estrato alto — recomendar universitario
        nivel = 'Universitario'

    return area

# Aplicar la función a cada estudiante
df['area_recomendada'] = df.apply(asignar_area, axis=1)

# Ver cómo quedó la distribución
print("\nDistribución de áreas recomendadas:")
areas = {
    1: 'Ciencias exactas e ingeniería',
    2: 'Ciencias de la salud',
    3: 'Ciencias sociales y humanas',
    4: 'Artes y diseño',
    5: 'Ciencias económicas y administrativas',
    6: 'Educación',
    7: 'Técnico y tecnológico general'
}

conteo = df['area_recomendada'].value_counts().sort_index()
for codigo, cantidad in conteo.items():
    print(f"  Área {codigo} — {areas[codigo]}: {cantidad} estudiantes")

print(f"\nTotal estudiantes: {len(df)}")

# Guardar el dataset con la variable de salida
df.to_csv('dataset_con_variable_salida.csv', index=False)
print("\n✅ Dataset guardado como dataset_con_variable_salida.csv")
