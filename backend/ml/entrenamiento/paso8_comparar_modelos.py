# PASO 8 — Entrenar y comparar 5 modelos de Machine Learning
# Regresión Logística, Árbol de Decisión, Random Forest, KNN y SVM
import os
import json
import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.model_selection import (train_test_split, GridSearchCV,
                                     StratifiedKFold, cross_validate)
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix, classification_report)
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import warnings
warnings.filterwarnings('ignore')

os.makedirs('modelos', exist_ok=True)
os.makedirs('resultados', exist_ok=True)

# ============================================================
# 1. CARGAR EL DATASET
# ============================================================
df = pd.read_csv('dataset_con_variable_salida.csv')
print("="*60)
print("COMPARACIÓN DE MODELOS — ORIENTACIÓN VOCACIONAL (LOTUS.IA)")
print("="*60)
print(f"\nDataset cargado: {df.shape[0]} estudiantes, {df.shape[1]} columnas")

X = df.drop(columns=['area_recomendada'])
y = df['area_recomendada']

nombres_areas = ['Exactas/Ing', 'Salud', 'Sociales',
                 'Artes', 'Económicas', 'Educación', 'Técnico']

# ============================================================
# 2. DIVIDIR EL DATASET: 80% ENTRENAMIENTO, 20% PRUEBA
# ============================================================
# Misma división para todos los modelos, así la comparación es justa
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"Entrenamiento: {len(X_train)} estudiantes | Prueba: {len(X_test)} estudiantes")

# ============================================================
# 3. DEFINIR LOS MODELOS Y SUS HIPERPARÁMETROS A PROBAR
# ============================================================
# class_weight='balanced' corrige el desbalance de clases
# (KNN no tiene esa opción)
modelos = {
    'Regresión Logística': (
        LogisticRegression(max_iter=2000, random_state=42, class_weight='balanced'),
        {'C': [0.1, 1, 10, 100]}
    ),
    'Árbol de Decisión': (
        DecisionTreeClassifier(random_state=42, class_weight='balanced'),
        {'max_depth': [5, 10, 15, None],
         'min_samples_leaf': [1, 3, 5]}
    ),
    'Random Forest': (
        RandomForestClassifier(random_state=42, class_weight='balanced', n_jobs=-1),
        {'n_estimators': [100, 300],
         'max_depth': [10, 20, None]}
    ),
    'KNN': (
        KNeighborsClassifier(),
        {'n_neighbors': [3, 5, 7, 9, 11],
         'weights': ['uniform', 'distance']}
    ),
    'SVM': (
        SVC(random_state=42, class_weight='balanced'),
        {'C': [0.1, 1, 10, 100],
         'kernel': ['linear', 'rbf']}
    ),
}

archivos = {
    'Regresión Logística': 'regresion_logistica',
    'Árbol de Decisión': 'arbol_decision',
    'Random Forest': 'random_forest',
    'KNN': 'knn',
    'SVM': 'svm',
}

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
resultados = []
entrenados = {}

# ============================================================
# 4. ENTRENAR Y EVALUAR CADA MODELO
# ============================================================
for nombre, (modelo_base, parametros) in modelos.items():
    print(f"\n{'='*60}")
    print(f"ENTRENANDO: {nombre}")
    print(f"{'='*60}")

    # Buscar los mejores hiperparámetros con validación cruzada (solo datos de entrenamiento)
    busqueda = GridSearchCV(modelo_base, parametros, cv=cv,
                            scoring='f1_weighted', n_jobs=-1)
    busqueda.fit(X_train, y_train)
    modelo = busqueda.best_estimator_
    print(f"  Mejores hiperparámetros: {busqueda.best_params_}")

    # Evaluar en el 20% de prueba
    y_pred = modelo.predict(X_test)
    accuracy  = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall    = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1        = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    print(f"  Accuracy:  {accuracy*100:.2f}%")
    print(f"  Precision: {precision*100:.2f}%")
    print(f"  Recall:    {recall*100:.2f}%")
    print(f"  F1 Score:  {f1*100:.2f}%")

    # Validación cruzada de 5 pliegues sobre todo el dataset
    cv_scores = cross_validate(modelo, X, y, cv=cv, n_jobs=-1,
                               scoring=['accuracy', 'precision_weighted',
                                        'recall_weighted', 'f1_weighted'])
    print(f"  Validación cruzada (F1): {cv_scores['test_f1_weighted'].mean()*100:.2f}% "
          f"± {cv_scores['test_f1_weighted'].std()*100:.2f}%")

    resultados.append({
        'Modelo': nombre,
        'Accuracy': accuracy,
        'Precision': precision,
        'Recall': recall,
        'F1 Score': f1,
        'CV Accuracy': cv_scores['test_accuracy'].mean(),
        'CV Precision': cv_scores['test_precision_weighted'].mean(),
        'CV Recall': cv_scores['test_recall_weighted'].mean(),
        'CV F1': cv_scores['test_f1_weighted'].mean(),
        'CV F1 (desv.)': cv_scores['test_f1_weighted'].std(),
        'Hiperparámetros': str(busqueda.best_params_),
    })
    entrenados[nombre] = (modelo, busqueda.best_params_)

    # Guardar el modelo
    joblib.dump(modelo, f"modelos/modelo_{archivos[nombre]}.pkl")

    # Reporte por área
    reporte = classification_report(y_test, y_pred, target_names=nombres_areas,
                                    zero_division=0)
    with open(f"resultados/reporte_{archivos[nombre]}.txt", 'w', encoding='utf-8') as f:
        f.write(f"{nombre}\nHiperparámetros: {busqueda.best_params_}\n\n{reporte}")

    # Matriz de confusión
    cm = confusion_matrix(y_test, y_pred)
    plt.figure(figsize=(10, 7))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=nombres_areas, yticklabels=nombres_areas)
    plt.title(f'Matriz de Confusión — {nombre}', fontsize=14, pad=15)
    plt.ylabel('Área Real', fontsize=12)
    plt.xlabel('Área Predicha por el Modelo', fontsize=12)
    plt.xticks(rotation=30, ha='right')
    plt.tight_layout()
    plt.savefig(f"resultados/matriz_confusion_{archivos[nombre]}.png",
                dpi=150, bbox_inches='tight')
    plt.close()

# ============================================================
# 5. TABLA COMPARATIVA
# ============================================================
tabla = pd.DataFrame(resultados).sort_values('F1 Score', ascending=False)
tabla.to_csv('resultados/comparacion_modelos.csv', index=False, encoding='utf-8-sig')

print(f"\n{'='*60}")
print("TABLA COMPARATIVA (conjunto de prueba 20%)")
print(f"{'='*60}")
columnas = ['Modelo', 'Accuracy', 'Precision', 'Recall', 'F1 Score', 'CV F1']
print((tabla[columnas].set_index('Modelo') * 100).round(2).to_string())

# ============================================================
# 6. GRÁFICO COMPARATIVO
# ============================================================
metricas = ['Accuracy', 'Precision', 'Recall', 'F1 Score']
grafico = tabla.set_index('Modelo')[metricas] * 100
ax = grafico.plot(kind='bar', figsize=(12, 6), width=0.8,
                  color=['#4C72B0', '#55A868', '#C44E52', '#8172B2'])
ax.set_title('Comparación de Modelos — Conjunto de Prueba', fontsize=14, pad=15)
ax.set_ylabel('Porcentaje (%)')
ax.set_xlabel('')
ax.set_ylim(0, 110)
ax.legend(loc='upper center', ncol=4)
plt.xticks(rotation=0)
for contenedor in ax.containers:
    ax.bar_label(contenedor, fmt='%.1f', fontsize=8, padding=2)
plt.tight_layout()
plt.savefig('resultados/grafico_comparacion_modelos.png', dpi=150, bbox_inches='tight')
plt.close()

# ============================================================
# 7. ESCOGER EL MEJOR MODELO
# ============================================================
# Criterio: F1 Score (ponderado), porque las clases están desbalanceadas
# y el F1 equilibra la precisión y el recall
mejor = tabla.iloc[0]
modelo_final, params_final = entrenados[mejor['Modelo']]
joblib.dump(modelo_final, 'modelo_final.pkl')

info = {
    'modelo': mejor['Modelo'],
    'hiperparametros': {k: (v if not isinstance(v, np.generic) else v.item())
                        for k, v in params_final.items()},
    'metricas_prueba': {m: round(float(mejor[m]), 4) for m in metricas},
    'validacion_cruzada_f1': round(float(mejor['CV F1']), 4),
    'variables_entrada': list(X.columns),
    'columnas_normalizadas_con_scaler': [
        'punt_matematicas', 'punt_lectura_critica', 'punt_c_naturales',
        'punt_sociales_ciudadanas', 'punt_ingles', 'punt_global', 'edad',
        'fami_personashogar', 'fami_educacionpadre', 'fami_educacionmadre',
        'fami_estratovivienda'
    ],
    'areas': {1: 'Ciencias exactas e ingeniería', 2: 'Ciencias de la salud',
              3: 'Ciencias sociales y humanas', 4: 'Artes y diseño',
              5: 'Ciencias económicas y administrativas', 6: 'Educación',
              7: 'Técnico y tecnológico general'},
}
with open('modelo_final_info.json', 'w', encoding='utf-8') as f:
    json.dump(info, f, ensure_ascii=False, indent=2)

print(f"\n{'='*60}")
print("MODELO ESCOGIDO PARA LOTUS.IA")
print(f"{'='*60}")
print(f"  Modelo:     {mejor['Modelo']}")
print(f"  Accuracy:   {mejor['Accuracy']*100:.2f}%")
print(f"  Precision:  {mejor['Precision']*100:.2f}%")
print(f"  Recall:     {mejor['Recall']*100:.2f}%")
print(f"  F1 Score:   {mejor['F1 Score']*100:.2f}%")
print(f"  CV F1:      {mejor['CV F1']*100:.2f}%")
print(f"\n✅ Modelo final guardado como: modelo_final.pkl (+ modelo_final_info.json)")
print("✅ Los 5 modelos están en la carpeta: modelos/")
print("✅ Tabla, gráfico, reportes y matrices en la carpeta: resultados/")
