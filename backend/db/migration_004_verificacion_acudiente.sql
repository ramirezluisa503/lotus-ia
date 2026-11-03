-- =========================================================
-- Migración 004: verificación básica del acudiente
--   (fecha de nacimiento + mayoría de edad, documento obligatorio y
--   cruzado contra duplicados, declaración legal)
--
-- Solo necesaria si ya tienes una base de datos creada con la versión
-- anterior de schema.sql. En una instalación nueva, schema.sql ya incluye
-- este cambio -- no hace falta correr este archivo.
--
-- Las columnas quedan NULLABLE aquí porque las cuentas ya existentes no
-- tienen estos datos; la obligatoriedad para cuentas NUEVAS se aplica en
-- el backend (schemas/auth.py), no con una restricción NOT NULL que
-- rompería las filas viejas.
-- =========================================================

ALTER TABLE auth.usuarios ADD COLUMN documento_hash CHAR(64);
ALTER TABLE auth.usuarios ADD COLUMN fecha_nacimiento DATE;
ALTER TABLE auth.usuarios ADD COLUMN acepta_declaracion_legal BOOLEAN NOT NULL DEFAULT FALSE;

-- Postgres no compara NULLs entre sí para UNIQUE, así que las cuentas viejas
-- sin documento_hash conviven sin problema; solo se exige unicidad entre
-- las que sí lo tengan (las nuevas).
CREATE UNIQUE INDEX idx_usuarios_documento_hash ON auth.usuarios(documento_hash);
