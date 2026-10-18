# Paso 2 — Adaptar variables al contexto del proyecto
import pandas as pd

# Cargar el dataset
df = pd.read_csv('DATASET ICFES 2500 DATOS.csv')

print("Dataset original:", df.shape)

# Nos quedamos SOLO con las columnas útiles para el proyecto
columnas_utiles = [
    'estu_fechanacimiento',
    'estu_genero',
    'cole_area_ubicacion',
    'cole_naturaleza',
    'cole_caracter',
    'cole_jornada',
    'cole_depto_ubicacion',
    'fami_estratovivienda',
    'fami_personashogar',
    'fami_tieneinternet',
    'fami_tienecomputador',
    'fami_tienelavadora',
    'fami_tieneautomovil',
    'fami_educacionpadre',
    'fami_educacionmadre',
    'punt_matematicas',
    'punt_lectura_critica',
    'punt_c_naturales',
    'punt_sociales_ciudadanas',
    'punt_ingles',
    'punt_global',
    'desemp_ingles'
]

df = df[columnas_utiles]

print("Dataset adaptado:", df.shape)
print("\nColumnas seleccionadas:")
for col in df.columns:
    print(" -", col)

# Guardar el resultado
df.to_csv('dataset_paso2.csv', index=False)
print("\n✅ Archivo guardado como dataset_paso2.csv")
