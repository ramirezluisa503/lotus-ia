# Paso 4 — Codificación de variables categóricas
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder

# Cargar el archivo del paso anterior
df = pd.read_csv('dataset_paso3.csv')
print("Filas:", len(df))

# 4.1 Variables Si/No → 1/0
for col in ['fami_tieneinternet', 'fami_tienecomputador', 
            'fami_tienelavadora', 'fami_tieneautomovil']:
    df[col] = df[col].map({'Si': 1, 'No': 0})
print("✅ Variables Si/No codificadas")

# 4.2 Género → 1/0
df['estu_genero'] = df['estu_genero'].map({'M': 1, 'F': 0})
print("✅ Género codificado")

# 4.3 Zona → 1/0
df['cole_area_ubicacion'] = df['cole_area_ubicacion'].map({'URBANO': 1, 'RURAL': 0})
print("✅ Zona codificada")

# 4.4 Naturaleza institución → 1/0
df['cole_naturaleza'] = df['cole_naturaleza'].map({'OFICIAL': 0, 'NO OFICIAL': 1})
print("✅ Tipo institución codificado")

# 4.5 Estrato → número
df['fami_estratovivienda'] = pd.to_numeric(df['fami_estratovivienda'], errors='coerce')
print("✅ Estrato codificado")

# 4.6 Educación padres → escala del 0 al 9
orden_educacion = {
    'Ninguno': 0,
    'Primaria incompleta': 1,
    'Primaria completa': 2,
    'Secundaria (Bachillerato) incompleta': 3,
    'Secundaria (Bachillerato) completa': 4,
    'Técnica o tecnológica incompleta': 5,
    'Técnica o tecnológica completa': 6,
    'Educación profesional incompleta': 7,
    'Educación profesional completa': 8,
    'Postgrado': 9,
    'No sabe': np.nan
}
df['fami_educacionpadre'] = df['fami_educacionpadre'].map(orden_educacion)
df['fami_educacionmadre'] = df['fami_educacionmadre'].map(orden_educacion)
print("✅ Educación padres codificada")

# 4.7 Carácter del colegio
df['cole_caracter'] = df['cole_caracter'].map({
    'ACADÉMICO': 0, 'TÉCNICO': 1, 
    'TÉCNICO/ACADÉMICO': 2, 'NO APLICA': 3
})
print("✅ Carácter colegio codificado")

# 4.8 Jornada
df['cole_jornada'] = df['cole_jornada'].map({
    'MAÑANA': 0, 'TARDE': 1, 'NOCHE': 2, 
    'COMPLETA': 3, 'SABATINA': 4, 'UNICA': 5
})
print("✅ Jornada codificada")

# 4.9 Nivel de inglés
df['desemp_ingles'] = df['desemp_ingles'].map({
    'A-': 0, 'A1': 1, 'A2': 2, 'B1': 3, 'B+': 4
})
print("✅ Nivel inglés codificado")

# 4.10 Departamento → números
le = LabelEncoder()
df['cole_depto_ubicacion'] = le.fit_transform(
    df['cole_depto_ubicacion'].astype(str)
)
print("✅ Departamento codificado")

# 4.11 Rellenar vacíos restantes con la mediana
for col in df.select_dtypes(include=[np.number]).columns:
    df[col] = df[col].fillna(df[col].median())

print("\nDatos vacíos restantes:", df.isnull().sum().sum())
print("\nDataset codificado:")
print(df.head(3))

# Guardar
df.to_csv('dataset_paso4.csv', index=False)
print("\n✅ Archivo guardado como dataset_paso4.csv")