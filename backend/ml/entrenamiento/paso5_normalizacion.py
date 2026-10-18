# Paso 5 — Normalización
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
import joblib

# Cargar el archivo del paso anterior
df = pd.read_csv('dataset_paso4.csv')
print("Dataset antes de normalizar:")
print(df.describe().round(2))

# Columnas que vamos a normalizar (escala 0 a 1)
columnas_normalizar = [
    'punt_matematicas',
    'punt_lectura_critica',
    'punt_c_naturales',
    'punt_sociales_ciudadanas',
    'punt_ingles',
    'punt_global',
    'edad',
    'fami_personashogar',
    'fami_educacionpadre',
    'fami_educacionmadre',
    'fami_estratovivienda'
]

# Aplicar la normalización
scaler = MinMaxScaler()
df[columnas_normalizar] = scaler.fit_transform(df[columnas_normalizar])

# Guardar el scaler para normalizar igual los datos de estudiantes nuevos (Lotus.IA)
joblib.dump(scaler, 'scaler.pkl')
print("✅ Scaler guardado como scaler.pkl")

print("\nDataset después de normalizar:")
print(df[columnas_normalizar].describe().round(2))

print("\nPrimeras 3 filas del dataset final:")
print(df.head(3))

print("\nResumen final:")
print(f"  Filas: {df.shape[0]}")
print(f"  Columnas: {df.shape[1]}")
print(f"  Datos vacíos: {df.isnull().sum().sum()}")

# Guardar el dataset final
df.to_csv('dataset_final.csv', index=False)
print("\n✅ Dataset final guardado como dataset_final.csv")
print("¡Listo para entrenar los modelos de Machine Learning!")