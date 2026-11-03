-- Exige confirmar el correo por enlace antes de poder iniciar sesión
-- (sugerencia del profesor: validar que los correos de registro existan
-- de verdad). DEFAULT TRUE para no bloquear las cuentas ya existentes;
-- las cuentas nuevas la ponen en FALSE explícitamente al registrarse.
ALTER TABLE auth.usuarios
  ADD COLUMN IF NOT EXISTS correo_confirmado BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS auth.tokens_confirmacion_correo (
  id          BIGSERIAL PRIMARY KEY,
  usuario_id  UUID NOT NULL REFERENCES auth.usuarios(id) ON DELETE CASCADE,
  token_hash  CHAR(64) NOT NULL UNIQUE,
  expira_en   TIMESTAMPTZ NOT NULL,
  usado       BOOLEAN NOT NULL DEFAULT FALSE
);
