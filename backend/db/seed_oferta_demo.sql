-- =========================================================
-- Oferta académica y becas DEMO (datos de ejemplo)
-- Instituciones reales de Pereira, pero costos, modalidades y fechas
-- de cierre son ILUSTRATIVOS. Verificar y actualizar con datos reales
-- (o conectar a un administrador que los mantenga) antes de producción.
-- =========================================================

INSERT INTO app.instituciones (nombre, caracter, sector, sitio_web, direccion) VALUES
  ('Universidad Tecnológica de Pereira', 'UNIVERSIDAD', 'OFICIAL', 'https://www.utp.edu.co', 'La Julita, Pereira'),
  ('Universidad Católica de Pereira', 'UNIVERSIDAD', 'PRIVADO', 'https://www.ucp.edu.co', 'Av. Las Américas #28-10, Pereira'),
  ('Universidad Libre Seccional Pereira', 'UNIVERSIDAD', 'PRIVADO', 'https://www.unilibre.edu.co', 'Belmonte, Pereira'),
  ('Fundación Universitaria del Área Andina - Pereira', 'INSTITUCION_UNIVERSITARIA', 'PRIVADO', 'https://www.areandina.edu.co', 'Pereira'),
  ('SENA Regional Risaralda', 'INSTITUCION_TECNICA_PROFESIONAL', 'OFICIAL', 'https://www.sena.edu.co', 'Pereira');

-- Carreras (nombre_institucion, nombre_area_conocimiento, nombre_carrera, nivel, modalidad, duracion, costo_semestre)
INSERT INTO app.carreras (institucion_id, area_id, nombre, nivel_formacion, modalidad, duracion_semestres, costo_semestre, vigente)
SELECT i.id, a.id, d.nombre, d.nivel, d.modalidad, d.duracion, d.costo, true
FROM (VALUES
  ('Universidad Tecnológica de Pereira', 'Ingeniería, arquitectura, urbanismo y afines', 'Ingeniería de Sistemas y Computación', 'UNIVERSITARIO', 'PRESENCIAL', 10, 900000),
  ('Universidad Tecnológica de Pereira', 'Ciencias de la educación', 'Licenciatura en Pedagogía Infantil', 'UNIVERSITARIO', 'PRESENCIAL', 10, 750000),
  ('Universidad Tecnológica de Pereira', 'Ciencias de la salud', 'Medicina', 'UNIVERSITARIO', 'PRESENCIAL', 12, 1200000),
  ('Universidad Tecnológica de Pereira', 'Agronomía, veterinaria y afines', 'Administración Ambiental', 'UNIVERSITARIO', 'PRESENCIAL', 10, 800000),
  ('Universidad Tecnológica de Pereira', 'Matemáticas y ciencias naturales', 'Matemáticas', 'UNIVERSITARIO', 'PRESENCIAL', 10, 750000),

  ('Universidad Católica de Pereira', 'Ingeniería, arquitectura, urbanismo y afines', 'Tecnología en Desarrollo de Software', 'TECNOLOGICO', 'PRESENCIAL', 6, 3200000),
  ('Universidad Católica de Pereira', 'Ciencias sociales y humanas', 'Psicología', 'UNIVERSITARIO', 'PRESENCIAL', 10, 4100000),
  ('Universidad Católica de Pereira', 'Economía, administración, contaduría y afines', 'Contaduría Pública', 'UNIVERSITARIO', 'PRESENCIAL', 9, 3800000),
  ('Universidad Católica de Pereira', 'Bellas artes', 'Diseño Gráfico', 'UNIVERSITARIO', 'PRESENCIAL', 8, 4300000),

  ('Universidad Libre Seccional Pereira', 'Ciencias sociales y humanas', 'Derecho', 'UNIVERSITARIO', 'PRESENCIAL', 10, 4500000),
  ('Universidad Libre Seccional Pereira', 'Economía, administración, contaduría y afines', 'Ingeniería Comercial', 'UNIVERSITARIO', 'PRESENCIAL', 9, 4200000),
  ('Universidad Libre Seccional Pereira', 'Ciencias de la salud', 'Enfermería', 'UNIVERSITARIO', 'PRESENCIAL', 9, 4600000),

  ('Fundación Universitaria del Área Andina - Pereira', 'Economía, administración, contaduría y afines', 'Tecnología en Logística', 'TECNOLOGICO', 'PRESENCIAL', 6, 2900000),
  ('Fundación Universitaria del Área Andina - Pereira', 'Economía, administración, contaduría y afines', 'Negocios Internacionales', 'UNIVERSITARIO', 'PRESENCIAL', 9, 3900000),

  ('SENA Regional Risaralda', 'Ingeniería, arquitectura, urbanismo y afines', 'Técnico en Sistemas', 'TECNICO_PROFESIONAL', 'PRESENCIAL', 4, 0),
  ('SENA Regional Risaralda', 'Economía, administración, contaduría y afines', 'Técnico en Contabilización de Operaciones Comerciales', 'TECNICO_PROFESIONAL', 'PRESENCIAL', 4, 0)
) AS d(institucion, area, nombre, nivel, modalidad, duracion, costo)
JOIN app.instituciones i ON i.nombre = d.institucion
JOIN app.areas_conocimiento a ON a.nombre = d.area;

-- Becas (universales: aplican a todas las áreas de conocimiento)
INSERT INTO app.becas (institucion_id, nombre, entidad, descripcion, cobertura, estrato_maximo, url, fecha_cierre, vigente) VALUES
  (NULL, 'Generación E', 'Ministerio de Educación Nacional / ICETEX', 'Apoyo a estudiantes de bajos recursos y buen desempeño académico para acceder y permanecer en la educación superior.', 'Matrícula y sostenimiento', 3, 'https://www.mineducacion.gov.co/portal/generacion-e/', NULL, true),
  (NULL, 'Jóvenes en Acción', 'Prosperidad Social (DPS)', 'Apoyo económico mensual para jóvenes en situación de pobreza o vulnerabilidad que estén estudiando educación superior o técnica.', 'Apoyo económico mensual', 3, 'https://prosperidadsocial.gov.co/sgpp/transferencias/jovenes-en-accion/', NULL, true),
  ((SELECT id FROM app.instituciones WHERE nombre = 'Universidad Tecnológica de Pereira'), 'Beca Mejores Bachilleres UTP', 'Universidad Tecnológica de Pereira', 'Descuento en matrícula para los mejores puntajes Saber 11 que ingresen a la UTP.', 'Descuento en matrícula', NULL, 'https://www.utp.edu.co', NULL, true);

INSERT INTO app.becas_areas (beca_id, area_id)
SELECT b.id, a.id
FROM app.becas b, app.areas_conocimiento a
WHERE b.nombre IN ('Generación E', 'Jóvenes en Acción', 'Beca Mejores Bachilleres UTP');
