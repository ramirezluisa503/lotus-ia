-- Registro de los modelos de IA en app.modelos_ml.
--
-- '0.1-reglas' fue el placeholder basado en reglas simples que se usó
-- mientras no existía un modelo entrenado. Queda aquí desactivado, solo
-- como referencia histórica.
--
-- '1.0-arbol' es el modelo real: Árbol de Decisión entrenado con datos
-- ICFES Saber 11 (ver backend/ml/README.md). Es el que queda activo.
INSERT INTO app.modelos_ml (version, algoritmo, ruta_archivo, entrenado_en, activo)
VALUES ('0.1-reglas', 'Reglas (placeholder, no es ML entrenado)', 'app/ia/modelo.py', '2026-10-13', false);

INSERT INTO app.modelos_ml (version, algoritmo, ruta_archivo, exactitud, precision_macro, recall_macro, f1_macro, entrenado_en, activo)
VALUES ('1.0-arbol', 'DecisionTreeClassifier', 'ml/modelo_arbol_decision_v1.pkl', 0.8652, 0.7582, 0.7531, 0.7513, '2026-10-18', true);
