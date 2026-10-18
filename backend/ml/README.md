# Modelo de IA de Lotus.IA — Árbol de Decisión v1

## Archivos

| Archivo | Qué es |
|---|---|
| `modelo_arbol_decision_v1.pkl` | `DecisionTreeClassifier` entrenado (joblib) |
| `scaler_v1.pkl` | `MinMaxScaler` usado antes de entrenar (joblib). Se aplica solo a 11 columnas |
| `preprocesamiento_v1.json` | Orden de las 22 variables, codificación de cada categoría, medianas para datos faltantes, columnas del scaler y significado de la salida |
| `metricas_v1.json` | Métricas para la tabla `app.modelos_ml` |
| `ejemplo_prediccion.py` | Implementación de referencia de `preprocesar()` + `predecir()`. **Verificada:** reproduce el 100 % de las predicciones del entrenamiento a partir de los datos crudos |
| `entrenamiento/` | Scripts originales (pasos 1–6 y 8), tabla comparativa, gráfico y matriz de confusión |

Dependencias que hay que agregar a `requirements.txt`, con las mismas versiones con las que se entrenó
(un `.pkl` de scikit-learn puede fallar o avisar con otra versión):

```
scikit-learn==1.7.2
joblib==1.5.2
numpy==2.3.5
pandas
```

## Variables de entrada (22, en este orden exacto)

Los datos vienen del formato del ICFES Saber 11. **No hay notas del colegio ni test RIASEC.**

| # | Variable | Valor crudo esperado | Transformación |
|---|---|---|---|
| 1 | `estu_genero` | `M` / `F` | M=1, F=0 |
| 2 | `cole_area_ubicacion` | `URBANO` / `RURAL` | 1 / 0 |
| 3 | `cole_naturaleza` | `OFICIAL` / `NO OFICIAL` | 0 / 1 |
| 4 | `cole_caracter` | `ACADÉMICO`, `TÉCNICO`, `TÉCNICO/ACADÉMICO`, `NO APLICA` | 0, 1, 2, 3 |
| 5 | `cole_jornada` | `MAÑANA`, `TARDE`, `NOCHE`, `COMPLETA`, `SABATINA`, `UNICA` | 0–5 |
| 6 | `cole_depto_ubicacion` | `ANTIOQUIA`, `BOGOTA`, `RISARALDA`, `SANTANDER`, `VALLE` | 0–4 (otro → mediana) |
| 7 | `fami_estratovivienda` | 1–6 | número, luego scaler |
| 8 | `fami_personashogar` | número de personas | número, luego scaler |
| 9–12 | `fami_tieneinternet`, `fami_tienecomputador`, `fami_tienelavadora`, `fami_tieneautomovil` | `Si` / `No` | 1 / 0 |
| 13–14 | `fami_educacionpadre`, `fami_educacionmadre` | `Ninguno` … `Postgrado` (ver JSON) | 0–9, `No sabe` → mediana; luego scaler |
| 15–19 | `punt_matematicas`, `punt_lectura_critica`, `punt_c_naturales`, `punt_sociales_ciudadanas`, `punt_ingles` | puntaje ICFES 0–100 | scaler |
| 20 | `punt_global` | puntaje global ICFES 0–500 | scaler |
| 21 | `desemp_ingles` | `A-`, `A1`, `A2`, `B1`, `B+` | 0–4 |
| 22 | `edad` | años | scaler |

Orden del preprocesamiento: **codificar → rellenar faltantes con la mediana → `scaler.transform` sobre
`columnas_scaler_en_orden` → `modelo.predict`**. El DataFrame debe tener los nombres de columna en el orden de `orden_variables`.

## Salida

`modelo.predict()` devuelve un **entero de 1 a 7** (no hay LabelEncoder):

| Código | Área |
|---|---|
| 1 | Ciencias exactas e ingeniería |
| 2 | Ciencias de la salud |
| 3 | Ciencias sociales y humanas |
| 4 | Artes y diseño |
| 5 | Ciencias económicas y administrativas |
| 6 | Educación |
| 7 | Técnico y tecnológico general |

Son **7 áreas propias del proyecto, no las 8 áreas SNIES** que usa la plataforma. Hay que definir con la autora
cómo se relacionan (propuesta: 1→Ingeniería, arquitectura, urbanismo y afines; 2→Ciencias de la salud;
3→Ciencias sociales y humanas; 4→Bellas artes; 5→Economía, administración, contaduría y afines;
6→Ciencias de la educación; 7→sin equivalente directo, es más un nivel de formación que un área).

`predict_proba()` funciona, pero en este árbol da 1.0 para todos los estudiantes del dataset (sus hojas son puras), así que no es una medida de confianza útil.

## Métricas (conjunto de prueba, 282 estudiantes)

Para `app.modelos_ml` (columnas *macro*):

| Campo | Valor |
|---|---|
| version | `1.0-arbol` |
| algoritmo | `DecisionTreeClassifier` |
| ruta_archivo | `ml/modelo_arbol_decision_v1.pkl` |
| exactitud | 0.8652 |
| precision_macro | 0.7582 |
| recall_macro | 0.7531 |
| f1_macro | 0.7513 |
| entrenado_en | 2026-10-18 |

En el documento del proyecto se reportan las métricas **ponderadas** (precision 0.8635, recall 0.8652, F1 0.8628).
Las *macro* son más bajas porque dan el mismo peso a las áreas con pocos estudiantes (Salud: 36, Exactas: 60).

## Explicaciones (REQF012)

El árbol es interpretable: con `modelo.decision_path(X)` y `modelo.tree_.feature` / `modelo.tree_.threshold`
se obtienen las condiciones que llevaron a la predicción. Los umbrales están en la escala normalizada (0–1);
para mostrarlos en la escala original, se invierte con `scaler_min` / `scaler_max` del JSON.

## Observaciones de los datos

- La etiqueta `area_recomendada` no es la carrera real de los estudiantes. Se generó con reglas sobre los puntajes
  (ver `entrenamiento/paso6_variable_salida.py`), así que el modelo aprende a reproducir esas reglas.
- 1404 de los 1409 estudiantes son de Risaralda, así que el departamento casi no aporta información.
- `fami_personashogar` estaba vacía en 710 registros y se rellenó con la mediana (3.5).
- Hay un registro con fecha de nacimiento errónea (edad 2019), así que el `scaler` de `edad` tiene un máximo de 2019.
  Al árbol no le afecta, pero hay que usar el scaler tal cual para que los umbrales coincidan.
