-- =========================================================
-- Oferta académica: universidades virtuales nacionales
-- (no tienen por qué tener sede en Pereira -- un estudiante de
-- cualquier parte de Colombia puede estudiar en ellas desde su casa)
--
-- Verificado por búsqueda web (2026-10-22) contra sitios oficiales:
-- - Politécnico Grancolombiano: SNIES de Ingeniería de Software (105591),
--   Psicología (101332) y Economía (101387), modalidad VIRTUAL confirmada
--   en fichas oficiales (qanda.poligran.edu.co).
-- - UNIMINUTO Virtual y a Distancia: Ingeniería de Sistemas (SNIES 111040,
--   10 periodos, 140 créditos) y Licenciatura en Educación Infantil
--   (SNIES 111285, 10 periodos, 140 créditos, registro calificado 13966
--   del 15/07/2022), ambas confirmadas en virtual.uniminuto.edu.
-- - UNAD: Administración de Empresas (SNIES 1688, Resolución 09260 de
--   2018, 151 créditos: 114 obligatorios + 37 electivos) confirmado en
--   un acuerdo oficial del Consejo Académico. NO se encontró la duración
--   en semestres ni un costo fijo por semestre -- la UNAD cobra por
--   crédito académico (0.1 SMLMV ≈ $142.000/crédito en 2025 para la
--   mayoría de programas, según sus "valores pecuniarios 2025"), no por
--   semestre completo, y además ofrece matrícula gratuita para
--   estudiantes de estrato 1-3 / Sisbén A-B-C que cumplan los requisitos
--   de la convocatoria vigente. Por eso duracion_semestres y
--   costo_semestre quedan en NULL en vez de inventar una cifra.
-- =========================================================

INSERT INTO app.instituciones (nombre, caracter, sector, sitio_web, direccion) VALUES
  ('Universidad Nacional Abierta y a Distancia (UNAD)', 'UNIVERSIDAD', 'OFICIAL', 'https://www.unad.edu.co', 'Nacional (100% virtual/a distancia)'),
  ('Politécnico Grancolombiano', 'INSTITUCION_UNIVERSITARIA', 'PRIVADO', 'https://www.poligran.edu.co', 'Nacional (modalidad virtual)'),
  ('Corporación Universitaria Minuto de Dios (UNIMINUTO Virtual y a Distancia)', 'INSTITUCION_UNIVERSITARIA', 'PRIVADO', 'https://www.uniminuto.edu', 'Nacional (modalidad virtual)');

INSERT INTO app.carreras (institucion_id, area_id, nombre, nivel_formacion, modalidad, duracion_semestres, costo_semestre, codigo_snies, vigente)
SELECT i.id, a.id, d.nombre, d.nivel, d.modalidad, d.duracion, d.costo, d.snies, true
FROM (VALUES
  ('Politécnico Grancolombiano', 'Ingeniería, arquitectura, urbanismo y afines', 'Ingeniería de Software', 'UNIVERSITARIO', 'VIRTUAL', NULL::smallint, NULL::numeric, 105591),
  ('Politécnico Grancolombiano', 'Ciencias sociales y humanas', 'Psicología', 'UNIVERSITARIO', 'VIRTUAL', NULL, NULL, 101332),
  ('Politécnico Grancolombiano', 'Economía, administración, contaduría y afines', 'Economía', 'UNIVERSITARIO', 'VIRTUAL', NULL, NULL, 101387),

  ('Corporación Universitaria Minuto de Dios (UNIMINUTO Virtual y a Distancia)', 'Ingeniería, arquitectura, urbanismo y afines', 'Ingeniería de Sistemas', 'UNIVERSITARIO', 'VIRTUAL', 10, NULL, 111040),
  ('Corporación Universitaria Minuto de Dios (UNIMINUTO Virtual y a Distancia)', 'Ciencias de la educación', 'Licenciatura en Educación Infantil', 'UNIVERSITARIO', 'VIRTUAL', 10, NULL, 111285),

  ('Universidad Nacional Abierta y a Distancia (UNAD)', 'Economía, administración, contaduría y afines', 'Administración de Empresas', 'UNIVERSITARIO', 'VIRTUAL', NULL, NULL, 1688)
) AS d(institucion, area, nombre, nivel, modalidad, duracion, costo, snies)
JOIN app.instituciones i ON i.nombre = d.institucion
JOIN app.areas_conocimiento a ON a.nombre = d.area;

-- Carrera real adicional de una institución ya existente (Universidad
-- Católica de Pereira): Administración de Empresas es su programa más
-- antiguo, vinculada a la Facultad de Ciencias Económicas y
-- Administrativas (confirmado en su libro institucional 50 años 1975-2025).
INSERT INTO app.carreras (institucion_id, area_id, nombre, nivel_formacion, modalidad, duracion_semestres, costo_semestre, codigo_snies, vigente)
SELECT i.id, a.id, 'Administración de Empresas', 'UNIVERSITARIO', 'PRESENCIAL', NULL, NULL, NULL, true
FROM app.instituciones i, app.areas_conocimiento a
WHERE i.nombre = 'Universidad Católica de Pereira'
  AND a.nombre = 'Economía, administración, contaduría y afines';
