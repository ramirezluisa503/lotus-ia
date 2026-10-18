-- =========================================================
-- Oferta académica y becas DEMO (datos de ejemplo)
-- Instituciones reales de Pereira. Varios datos fueron verificados con
-- búsqueda web (2026-10-18) contra los sitios oficiales de cada
-- institución y entidad -- ver detalle abajo. Los que NO llevan nota de
-- verificación (la mayoría de costos/duraciones de UTP, UCP, Unilibre,
-- Enfermería/Ing. Comercial/Contaduría/Psicología/Diseño Gráfico, y los
-- programas de SENA) siguen siendo ILUSTRATIVOS -- confirma con la
-- institución antes de usarlos en producción.
-- =========================================================

INSERT INTO app.instituciones (nombre, caracter, sector, sitio_web, direccion) VALUES
  ('Universidad Tecnológica de Pereira', 'UNIVERSIDAD', 'OFICIAL', 'https://www.utp.edu.co', 'La Julita, Pereira'),
  ('Universidad Católica de Pereira', 'UNIVERSIDAD', 'PRIVADO', 'https://www.ucp.edu.co', 'Av. Las Américas #28-10, Pereira'),
  ('Universidad Libre Seccional Pereira', 'UNIVERSIDAD', 'PRIVADO', 'https://www.unilibre.edu.co', 'Belmonte, Pereira'),
  ('Fundación Universitaria del Área Andina - Pereira', 'INSTITUCION_UNIVERSITARIA', 'PRIVADO', 'https://www.areandina.edu.co', 'Pereira'),
  ('SENA Regional Risaralda', 'INSTITUCION_TECNICA_PROFESIONAL', 'OFICIAL', 'https://www.sena.edu.co', 'Pereira');

-- Carreras (nombre_institucion, nombre_area_conocimiento, nombre_carrera, nivel, modalidad, duracion, costo_semestre)
-- Verificado en utp.edu.co: Medicina = 13 semestres (programa oficial, pregrado presencial).
-- Verificado en ucp.edu.co: Tecnología en Desarrollo de Software = 6 semestres, SNIES 105106.
-- Verificado en unilibre.edu.co: Derecho = 10 semestres, costo 2025 ≈ $5.080.000 (confirmar vigente).
-- Verificado en areandina.edu.co: "Administración de Negocios Internacionales" (no "Negocios Internacionales")
--   = 8 semestres, ≈ $4.670.000; Tecnología en Logística es VIRTUAL (no presencial).
INSERT INTO app.carreras (institucion_id, area_id, nombre, nivel_formacion, modalidad, duracion_semestres, costo_semestre, codigo_snies, vigente)
SELECT i.id, a.id, d.nombre, d.nivel, d.modalidad, d.duracion, d.costo, d.snies, true
FROM (VALUES
  ('Universidad Tecnológica de Pereira', 'Ingeniería, arquitectura, urbanismo y afines', 'Ingeniería de Sistemas y Computación', 'UNIVERSITARIO', 'PRESENCIAL', 10, 900000, NULL::int),
  ('Universidad Tecnológica de Pereira', 'Ciencias de la educación', 'Licenciatura en Pedagogía Infantil', 'UNIVERSITARIO', 'PRESENCIAL', 10, 750000, NULL),
  ('Universidad Tecnológica de Pereira', 'Ciencias de la salud', 'Medicina', 'UNIVERSITARIO', 'PRESENCIAL', 13, 1200000, NULL),
  ('Universidad Tecnológica de Pereira', 'Agronomía, veterinaria y afines', 'Administración Ambiental', 'UNIVERSITARIO', 'PRESENCIAL', 10, 800000, NULL),
  ('Universidad Tecnológica de Pereira', 'Matemáticas y ciencias naturales', 'Matemáticas', 'UNIVERSITARIO', 'PRESENCIAL', 10, 750000, NULL),

  ('Universidad Católica de Pereira', 'Ingeniería, arquitectura, urbanismo y afines', 'Tecnología en Desarrollo de Software', 'TECNOLOGICO', 'PRESENCIAL', 6, 3200000, 105106),
  ('Universidad Católica de Pereira', 'Ciencias sociales y humanas', 'Psicología', 'UNIVERSITARIO', 'PRESENCIAL', 10, 4100000, NULL),
  ('Universidad Católica de Pereira', 'Economía, administración, contaduría y afines', 'Contaduría Pública', 'UNIVERSITARIO', 'PRESENCIAL', 9, 3800000, NULL),
  ('Universidad Católica de Pereira', 'Bellas artes', 'Diseño Gráfico', 'UNIVERSITARIO', 'PRESENCIAL', 8, 4300000, NULL),

  ('Universidad Libre Seccional Pereira', 'Ciencias sociales y humanas', 'Derecho', 'UNIVERSITARIO', 'PRESENCIAL', 10, 5080000, NULL),
  ('Universidad Libre Seccional Pereira', 'Economía, administración, contaduría y afines', 'Ingeniería Comercial', 'UNIVERSITARIO', 'PRESENCIAL', 9, 4200000, NULL),
  ('Universidad Libre Seccional Pereira', 'Ciencias de la salud', 'Enfermería', 'UNIVERSITARIO', 'PRESENCIAL', 9, 4600000, NULL),

  ('Fundación Universitaria del Área Andina - Pereira', 'Economía, administración, contaduría y afines', 'Tecnología en Logística', 'TECNOLOGICO', 'VIRTUAL', 6, 2900000, NULL),
  ('Fundación Universitaria del Área Andina - Pereira', 'Economía, administración, contaduría y afines', 'Administración de Negocios Internacionales', 'UNIVERSITARIO', 'PRESENCIAL', 8, 4670000, NULL),

  ('SENA Regional Risaralda', 'Ingeniería, arquitectura, urbanismo y afines', 'Técnico en Sistemas', 'TECNICO_PROFESIONAL', 'PRESENCIAL', 4, 0, NULL),
  ('SENA Regional Risaralda', 'Economía, administración, contaduría y afines', 'Técnico en Contabilización de Operaciones Comerciales', 'TECNICO_PROFESIONAL', 'PRESENCIAL', 4, 0, NULL)
) AS d(institucion, area, nombre, nivel, modalidad, duracion, costo, snies)
JOIN app.instituciones i ON i.nombre = d.institucion
JOIN app.areas_conocimiento a ON a.nombre = d.area;

-- Becas (universales: aplican a todas las áreas de conocimiento)
-- Verificado: Generación E (ICETEX/Mineducación, componentes Equidad/Excelencia/Equipo) sigue vigente.
-- CORREGIDO: "Jóvenes en Acción" fue reemplazado por "Renta Joven" desde 2024 (no es el mismo programa
--   con nombre viejo: verificar si hay inscripciones abiertas o solo continúa pagando beneficiarios activos).
-- CORREGIDO: no existe una "Beca Mejores Bachilleres UTP" -- el programa real encontrado es
--   "Becas Talento UTP" (empresarios.utp.edu.co), financiado por empresas aliadas.
INSERT INTO app.becas (institucion_id, nombre, entidad, descripcion, cobertura, estrato_maximo, url, fecha_cierre, vigente) VALUES
  (NULL, 'Generación E', 'Ministerio de Educación Nacional / ICETEX',
   'Financia estudiantes de bajos recursos en IES públicas (componente Equidad) y reconoce a bachilleres con buen desempeño en Saber 11 y Sisbén de bajos ingresos (componente Excelencia). Administrado por ICETEX.',
   'Matrícula y sostenimiento', 3, 'https://web.icetex.gov.co/es/generacion-e', NULL, true),
  (NULL, 'Renta Joven', 'Prosperidad Social',
   'Transferencia monetaria para jóvenes de 14 a 28 años en condición de vulnerabilidad, matriculados en SENA, Escuelas Normales Superiores o instituciones públicas de educación superior. Reemplazó a Jóvenes en Acción desde 2024; verificar en la fuente si hay inscripciones abiertas o solo continúa pagando a beneficiarios ya activos.',
   'Apoyo económico mensual', 3, 'https://prosperidadsocial.gov.co', NULL, true),
  ((SELECT id FROM app.instituciones WHERE nombre = 'Universidad Tecnológica de Pereira'), 'Becas Talento UTP', 'Universidad Tecnológica de Pereira',
   'Beca financiada por empresas aliadas (alianza público-privada) para estudiantes de la UTP con buen desempeño académico (promedio 4.0 o superior) y vulnerabilidad económica (estrato 1-2, algunos casos estrato 3). Cubre el 100% de la matrícula más un estipendio mensual para alimentación, transporte y materiales.',
   'Matrícula completa + estipendio mensual', 3, 'https://empresarios.utp.edu.co/aportar-aliado/programa-de-becas-de-talento/', NULL, true);

INSERT INTO app.becas_areas (beca_id, area_id)
SELECT b.id, a.id
FROM app.becas b, app.areas_conocimiento a
WHERE b.nombre IN ('Generación E', 'Renta Joven', 'Becas Talento UTP');
