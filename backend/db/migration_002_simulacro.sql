-- =========================================================
-- Migración 002: puntaje de simulacro/pre-ICFES como alternativa al
-- resultado oficial (los estudiantes de grado 10 aún no presentan el
-- Saber 11 real).
--
-- Solo necesaria si ya tienes una base de datos creada con la versión
-- anterior de schema.sql. En una instalación nueva, schema.sql ya incluye
-- este cambio -- no hace falta correr este archivo.
-- =========================================================

ALTER TABLE app.estudiantes ADD COLUMN es_puntaje_simulacro BOOLEAN NOT NULL DEFAULT FALSE;
