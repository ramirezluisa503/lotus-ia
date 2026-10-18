# Paso 3 — Limpieza de datos
import pandas as pd
import numpy as np
from datetime import datetime

# Cargar el archivo del paso anterior
df = pd.read_csv('dataset_paso2.csv')
print("Filas antes de limpiar:", len(df))

# 3.1 Calcular edad desde la fecha de nacimiento
def calcular_edad(fecha):
    try:
        nacimiento = datetime.strptime(str(fecha), '%d/%m/%Y')
        referencia = datetime(2022, 6, 1)
        return referencia.year - nacimiento.year
    except:
        return None

df['edad'] = df['estu_fechanacimiento'].apply(calcular_edad)
df = df.drop(columns=['estu_fechanacimiento'])
print("✅ Edad calculada")

# 3.2 Limpiar estrato (quitar la palabra Estrato)
df['fami_estratovivienda'] = df['fami_estratovivienda'].str.replace('Estrato ', '', regex=False).str.strip()
df['fami_estratovivienda'] = df['fami_estratovivienda'].replace('Sin Estrato', np.nan)
print("✅ Estrato limpiado")

# 3.3 Limpiar personas en el hogar
def limpiar_personas(valor):
    try:
        if pd.isna(valor): return np.nan
        valor = str(valor).strip()
        if 'a' in valor:
            partes = valor.split('a')
            return (float(partes[0].strip()) + float(partes[1].strip())) / 2
        return float(valor)
    except:
        return np.nan

df['fami_personashogar'] = df['fami_personashogar'].apply(limpiar_personas)
print("✅ Personas del hogar limpiadas")

# 3.4 Eliminar filas con datos vacíos en columnas importantes
df = df.dropna(subset=[
    'punt_matematicas',
    'punt_lectura_critica',
    'punt_c_naturales',
    'punt_sociales_ciudadanas',
    'punt_global',
    'fami_estratovivienda',
    'fami_tieneinternet',
    'fami_tienecomputador',
    'estu_genero',
    'cole_area_ubicacion',
    'edad'
])

print("✅ Filas incompletas eliminadas")
print("Filas después de limpiar:", len(df))

# Ver cuántos datos vacíos quedan
print("\nDatos vacíos por columna:")
print(df.isnull().sum())

# Guardar
df.to_csv('dataset_paso3.csv', index=False)
print("\n✅ Archivo guardado como dataset_paso3.csv")