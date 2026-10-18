# Paso 1 — Cargar y explorar el dataset
import pandas as pd

# Cargar el archivo — escribe el nombre exacto de tu archivo
df = pd.read_csv('DATASET ICFES 2500 DATOS.csv')

# Ver cuántas filas y columnas tiene
print("Filas y columnas:", df.shape)

# Ver los nombres de todas las columnas
print("\nColumnas disponibles:")
for col in df.columns:
    print(" -", col)

# Ver las primeras 3 filas
print("\nPrimeras 3 filas:")
print(df.head(3))