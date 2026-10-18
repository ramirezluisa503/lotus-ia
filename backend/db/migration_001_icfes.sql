-- =========================================================
-- Migración 001: variables requeridas por el modelo de IA real
-- (Árbol de Decisión entrenado con ICFES Saber 11, ver backend/ml/README.md)
--
-- Solo necesaria si ya tienes una base de datos creada con la versión
-- anterior de schema.sql. En una instalación nueva, schema.sql ya incluye
-- estos cambios -- no hace falta correr este archivo.
-- =========================================================

-- Las notas pasan de "nota escolar 1.0-5.0" a "puntaje ICFES 0-100"
ALTER TABLE app.rendimiento_academico DROP CONSTRAINT rendimiento_academico_nota_check;
ALTER TABLE app.rendimiento_academico ALTER COLUMN nota TYPE NUMERIC(5,2);
ALTER TABLE app.rendimiento_academico ADD CONSTRAINT rendimiento_academico_nota_check CHECK (nota BETWEEN 0 AND 100);

-- Variables del colegio y puntaje global/inglés del ICFES
ALTER TABLE app.estudiantes ADD COLUMN puntaje_global_icfes SMALLINT CHECK (puntaje_global_icfes BETWEEN 0 AND 500);
ALTER TABLE app.estudiantes ADD COLUMN desempeno_ingles VARCHAR(2) CHECK (desempeno_ingles IN ('A-','A1','A2','B1','B+'));
ALTER TABLE app.estudiantes ADD COLUMN cole_caracter VARCHAR(20) CHECK (cole_caracter IN ('ACADEMICO','TECNICO','TECNICO_ACADEMICO','NO_APLICA'));
ALTER TABLE app.estudiantes ADD COLUMN cole_jornada VARCHAR(10) CHECK (cole_jornada IN ('MANANA','TARDE','NOCHE','COMPLETA','SABATINA','UNICA'));

-- Bienes del hogar que usa el modelo
ALTER TABLE app.datos_socioeconomicos ADD COLUMN tiene_lavadora BOOLEAN;
ALTER TABLE app.datos_socioeconomicos ADD COLUMN tiene_automovil BOOLEAN;

-- Las etiquetas de nivel educativo del modelo son más largas que 30 caracteres
ALTER TABLE app.datos_socioeconomicos ALTER COLUMN educacion_madre TYPE VARCHAR(50);
ALTER TABLE app.datos_socioeconomicos ALTER COLUMN educacion_padre TYPE VARCHAR(50);

-- Registrar el modelo real y desactivar el placeholder de reglas
UPDATE app.modelos_ml SET activo = false WHERE version = '0.1-reglas';
INSERT INTO app.modelos_ml (version, algoritmo, ruta_archivo, exactitud, precision_macro, recall_macro, f1_macro, entrenado_en, activo)
VALUES ('1.0-arbol', 'DecisionTreeClassifier', 'ml/modelo_arbol_decision_v1.pkl', 0.8652, 0.7582, 0.7531, 0.7513, '2026-10-18', true)
ON CONFLICT (version) DO NOTHING;
