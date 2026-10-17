-- Registro del modelo PLACEHOLDER basado en reglas (ver backend/app/ia/modelo.py).
-- Cuando se entrene el modelo real, insertar la nueva versión aquí,
-- desactivar esta (activo = false) y activar la nueva.
INSERT INTO app.modelos_ml (version, algoritmo, ruta_archivo, entrenado_en, activo)
VALUES ('0.1-reglas', 'Reglas (placeholder, no es ML entrenado)', 'app/ia/modelo.py', now(), true);
