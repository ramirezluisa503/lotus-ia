-- =========================================================
-- Plataforma de orientación vocacional Lotus.IA – Modelo físico
-- Motor: PostgreSQL 16
-- Fuente: Capítulo 9 (Etapa de Diseño), sección 9.3.3
-- =========================================================
CREATE EXTENSION IF NOT EXISTS citext;

CREATE SCHEMA IF NOT EXISTS identidad; -- identidad y acceso
CREATE SCHEMA IF NOT EXISTS app;  -- datos del proceso vocacional (seudonimizados)

-- ---------------- ESQUEMA identidad (equivalente a "auth") ----------------

CREATE TABLE identidad.roles (
  id      SMALLSERIAL PRIMARY KEY,
  nombre  VARCHAR(20) NOT NULL UNIQUE
          CHECK (nombre IN ('ESTUDIANTE','ACUDIENTE','ADMINISTRADOR'))
);

CREATE TABLE identidad.usuarios (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correo             CITEXT       NOT NULL UNIQUE,
  contrasena_hash    VARCHAR(60)  NOT NULL,              -- bcrypt
  nombre_cifrado     BYTEA        NOT NULL,               -- cifrado en la aplicación
  documento_cifrado  BYTEA,                                -- solo acudientes
  rol_id             SMALLINT     NOT NULL REFERENCES identidad.roles(id),
  activo             BOOLEAN      NOT NULL DEFAULT TRUE,
  intentos_fallidos  SMALLINT     NOT NULL DEFAULT 0,
  creado_en          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  ultimo_acceso      TIMESTAMPTZ
);

CREATE TABLE identidad.vinculos_acudiente (
  acudiente_id            UUID NOT NULL REFERENCES identidad.usuarios(id) ON DELETE CASCADE,
  estudiante_usuario_id   UUID NOT NULL REFERENCES identidad.usuarios(id) ON DELETE CASCADE,
  parentesco              VARCHAR(12) NOT NULL
                           CHECK (parentesco IN ('MADRE','PADRE','TUTOR_LEGAL')),
  PRIMARY KEY (acudiente_id, estudiante_usuario_id)
);

CREATE TABLE identidad.tokens_recuperacion (
  id          BIGSERIAL PRIMARY KEY,
  usuario_id  UUID NOT NULL REFERENCES identidad.usuarios(id) ON DELETE CASCADE,
  token_hash  CHAR(64) NOT NULL UNIQUE,  -- SHA-256 del token enviado por correo
  expira_en   TIMESTAMPTZ NOT NULL,
  usado       BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE identidad.auditoria (
  id          BIGSERIAL PRIMARY KEY,
  usuario_id  UUID REFERENCES identidad.usuarios(id) ON DELETE SET NULL,
  accion      VARCHAR(40) NOT NULL, -- LOGIN, CONSENTIMIENTO, VER_RESULTADO, EXPORTAR...
  entidad     VARCHAR(40),
  entidad_id  VARCHAR(40),
  ip_hash     CHAR(64),             -- la IP se guarda como hash, no en claro
  fecha       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------- ESQUEMA app ----------------

CREATE TABLE app.estudiantes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- seudónimo
  grado             SMALLINT NOT NULL CHECK (grado IN (10, 11)),
  edad              SMALLINT CHECK (edad BETWEEN 13 AND 21),
  genero            VARCHAR(17)
                     CHECK (genero IN ('FEMENINO','MASCULINO','OTRO','PREFIERE_NO_DECIR')),
  zona              VARCHAR(6) CHECK (zona IN ('URBANA','RURAL')),
  tipo_institucion  VARCHAR(7) CHECK (tipo_institucion IN ('PUBLICA','PRIVADA')),
  estado_proceso    VARCHAR(15) NOT NULL DEFAULT 'REGISTRADO'
                     CHECK (estado_proceso IN ('REGISTRADO','AUTORIZADO','DATOS_COMPLETOS','RECOMENDADO')),
  creado_en         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Única tabla que une identidad y datos; solo la usa el módulo de autenticación
CREATE TABLE identidad.seudonimos (
  usuario_id     UUID PRIMARY KEY REFERENCES identidad.usuarios(id) ON DELETE CASCADE,
  estudiante_id  UUID NOT NULL UNIQUE REFERENCES app.estudiantes(id) ON DELETE CASCADE
);

CREATE TABLE app.consentimientos (
  id              BIGSERIAL PRIMARY KEY,
  estudiante_id   UUID NOT NULL REFERENCES app.estudiantes(id) ON DELETE CASCADE,
  tipo            VARCHAR(14) NOT NULL CHECK (tipo IN ('CONSENTIMIENTO','ASENTIMIENTO')),
  acudiente_id    UUID REFERENCES identidad.usuarios(id),
  version_texto   VARCHAR(10) NOT NULL, -- versión del texto legal aceptado
  aceptado        BOOLEAN NOT NULL,
  fecha           TIMESTAMPTZ NOT NULL DEFAULT now(),
  revocado_en     TIMESTAMPTZ,
  CHECK (tipo = 'ASENTIMIENTO' OR acudiente_id IS NOT NULL), -- el consentimiento lo da un acudiente
  UNIQUE (estudiante_id, tipo, version_texto)
);

CREATE TABLE app.areas_academicas (        -- Matemáticas, Lectura crítica, Ciencias naturales,
  id      SMALLSERIAL PRIMARY KEY,          -- Sociales y ciudadanas, Inglés (Saber 11)
  nombre  VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE app.rendimiento_academico (
  estudiante_id  UUID NOT NULL REFERENCES app.estudiantes(id) ON DELETE CASCADE,
  area_id        SMALLINT NOT NULL REFERENCES app.areas_academicas(id),
  nota           NUMERIC(2,1) NOT NULL CHECK (nota BETWEEN 1.0 AND 5.0),
  PRIMARY KEY (estudiante_id, area_id)
);

CREATE TABLE app.datos_socioeconomicos (
  estudiante_id          UUID PRIMARY KEY REFERENCES app.estudiantes(id) ON DELETE CASCADE,
  estrato                SMALLINT CHECK (estrato BETWEEN 0 AND 6), -- 0 = sin estrato
  rango_ingresos         VARCHAR(10), -- en salarios mínimos: '<1','1-2','2-3','3-5','>5'
  personas_hogar         SMALLINT CHECK (personas_hogar BETWEEN 1 AND 20),
  educacion_madre        VARCHAR(30),
  educacion_padre        VARCHAR(30),
  ocupacion_hogar        VARCHAR(40),
  tiene_internet         BOOLEAN,
  tiene_computador       BOOLEAN,
  recibe_apoyo_estatal   BOOLEAN,
  trabaja                BOOLEAN,
  actualizado_en         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE app.instrumentos (
  id      SMALLSERIAL PRIMARY KEY,
  nombre  VARCHAR(80) NOT NULL,
  version VARCHAR(10) NOT NULL,
  activo  BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (nombre, version)
);

CREATE TABLE app.preguntas (
  id              SERIAL PRIMARY KEY,
  instrumento_id  SMALLINT NOT NULL REFERENCES app.instrumentos(id),
  dimension       VARCHAR(30) NOT NULL, -- dimensión que mide el ítem
  enunciado       TEXT NOT NULL,
  orden           SMALLINT NOT NULL,
  UNIQUE (instrumento_id, orden)
);

CREATE TABLE app.respuestas (
  estudiante_id  UUID NOT NULL REFERENCES app.estudiantes(id) ON DELETE CASCADE,
  pregunta_id    INT NOT NULL REFERENCES app.preguntas(id),
  valor          SMALLINT NOT NULL CHECK (valor BETWEEN 1 AND 5), -- escala Likert
  respondida_en  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (estudiante_id, pregunta_id)
);

CREATE TABLE app.areas_conocimiento ( -- 8 áreas del SNIES
  id      SMALLSERIAL PRIMARY KEY,
  nombre  VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE app.instituciones ( -- IES con oferta en Pereira
  id         SERIAL PRIMARY KEY,
  nombre     VARCHAR(120) NOT NULL UNIQUE,
  caracter   VARCHAR(32) NOT NULL CHECK (caracter IN
             ('UNIVERSIDAD','INSTITUCION_UNIVERSITARIA',
              'INSTITUCION_TECNOLOGICA','INSTITUCION_TECNICA_PROFESIONAL')),
  sector     VARCHAR(7) NOT NULL CHECK (sector IN ('OFICIAL','PRIVADO')),
  sitio_web  VARCHAR(200),
  direccion  VARCHAR(150)
);

CREATE TABLE app.carreras (
  id                   SERIAL PRIMARY KEY,
  institucion_id       INT NOT NULL REFERENCES app.instituciones(id),
  area_id              SMALLINT NOT NULL REFERENCES app.areas_conocimiento(id),
  codigo_snies         INT UNIQUE,
  nombre               VARCHAR(150) NOT NULL,
  nivel_formacion      VARCHAR(19) NOT NULL
                        CHECK (nivel_formacion IN ('TECNICO_PROFESIONAL','TECNOLOGICO','UNIVERSITARIO')),
  modalidad            VARCHAR(10) NOT NULL
                        CHECK (modalidad IN ('PRESENCIAL','VIRTUAL','DISTANCIA','HIBRIDA')),
  duracion_semestres   SMALLINT CHECK (duracion_semestres BETWEEN 1 AND 14),
  costo_semestre       NUMERIC(12,0) CHECK (costo_semestre >= 0), -- pesos colombianos
  vigente              BOOLEAN NOT NULL DEFAULT TRUE,
  actualizado_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE app.becas (
  id               SERIAL PRIMARY KEY,
  institucion_id   INT REFERENCES app.instituciones(id), -- NULL = aplica a varias IES
  nombre           VARCHAR(150) NOT NULL,
  entidad          VARCHAR(120) NOT NULL,
  descripcion      TEXT,
  cobertura        VARCHAR(80),
  estrato_maximo   SMALLINT CHECK (estrato_maximo BETWEEN 1 AND 6),
  url              VARCHAR(250),
  fecha_cierre     DATE,
  vigente          BOOLEAN NOT NULL DEFAULT TRUE,
  actualizado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE app.becas_areas (
  beca_id  INT NOT NULL REFERENCES app.becas(id) ON DELETE CASCADE,
  area_id  SMALLINT NOT NULL REFERENCES app.areas_conocimiento(id),
  PRIMARY KEY (beca_id, area_id)
);

CREATE TABLE app.modelos_ml (
  id                SMALLSERIAL PRIMARY KEY,
  version           VARCHAR(20) NOT NULL UNIQUE,
  algoritmo         VARCHAR(40) NOT NULL,
  ruta_archivo      VARCHAR(200) NOT NULL, -- p. ej. modelos/modelo_v1.pkl
  exactitud         NUMERIC(5,4),
  precision_macro   NUMERIC(5,4),
  recall_macro      NUMERIC(5,4),
  f1_macro          NUMERIC(5,4),
  entrenado_en      TIMESTAMPTZ NOT NULL,
  activo            BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE app.recomendaciones (
  id                BIGSERIAL PRIMARY KEY,
  estudiante_id     UUID NOT NULL REFERENCES app.estudiantes(id) ON DELETE CASCADE,
  modelo_id         SMALLINT NOT NULL REFERENCES app.modelos_ml(id),
  area_id           SMALLINT NOT NULL REFERENCES app.areas_conocimiento(id),
  nivel_formacion   VARCHAR(19) NOT NULL
                     CHECK (nivel_formacion IN ('TECNICO_PROFESIONAL','TECNOLOGICO','UNIVERSITARIO')),
  probabilidad      NUMERIC(5,4) CHECK (probabilidad BETWEEN 0 AND 1),
  explicacion       TEXT NOT NULL,
  generada_en       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE app.encuestas_satisfaccion (
  id                 BIGSERIAL PRIMARY KEY,
  recomendacion_id   BIGINT NOT NULL UNIQUE REFERENCES app.recomendaciones(id) ON DELETE CASCADE,
  calificacion       SMALLINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario         VARCHAR(500),
  respondida_en      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------- ÍNDICES ----------------
CREATE UNIQUE INDEX uq_modelo_activo              ON app.modelos_ml (activo) WHERE activo;
CREATE INDEX ix_usuarios_rol                      ON identidad.usuarios (rol_id);
CREATE INDEX ix_consentimientos_estudiante        ON app.consentimientos (estudiante_id, tipo);
CREATE INDEX ix_carreras_area_nivel               ON app.carreras (area_id, nivel_formacion) WHERE vigente;
CREATE INDEX ix_becas_vigentes                    ON app.becas (fecha_cierre) WHERE vigente;
CREATE INDEX ix_recomendaciones_estudiante        ON app.recomendaciones (estudiante_id, generada_en DESC);
CREATE INDEX ix_auditoria_usuario_fecha           ON identidad.auditoria (usuario_id, fecha DESC);

-- ---------------- DATOS INICIALES ----------------
INSERT INTO identidad.roles (nombre) VALUES ('ESTUDIANTE'), ('ACUDIENTE'), ('ADMINISTRADOR');

INSERT INTO app.areas_academicas (nombre) VALUES
  ('Matemáticas'), ('Lectura crítica'), ('Ciencias naturales'),
  ('Sociales y ciudadanas'), ('Inglés');

INSERT INTO app.areas_conocimiento (nombre) VALUES
  ('Agronomía, veterinaria y afines'), ('Bellas artes'), ('Ciencias de la educación'),
  ('Ciencias de la salud'), ('Ciencias sociales y humanas'),
  ('Economía, administración, contaduría y afines'),
  ('Ingeniería, arquitectura, urbanismo y afines'), ('Matemáticas y ciencias naturales');
