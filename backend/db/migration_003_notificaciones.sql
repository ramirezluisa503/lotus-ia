-- =========================================================
-- Migración 003: sistema de notificaciones en la plataforma
--
-- Solo necesaria si ya tienes una base de datos creada con la versión
-- anterior de schema.sql. En una instalación nueva, schema.sql ya incluye
-- este cambio -- no hace falta correr este archivo.
-- =========================================================

CREATE TABLE auth.notificaciones (
  id          BIGSERIAL PRIMARY KEY,
  usuario_id  UUID NOT NULL REFERENCES auth.usuarios(id) ON DELETE CASCADE,
  tipo        VARCHAR(40) NOT NULL,
  mensaje     VARCHAR(300) NOT NULL,
  enlace      VARCHAR(100),
  leida       BOOLEAN NOT NULL DEFAULT FALSE,
  creada_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notificaciones_usuario ON auth.notificaciones(usuario_id, creada_en DESC);
