-- =========================================================
-- Instrumento psicométrico DEMO (placeholder)
-- Basado en el modelo RIASEC de Holland (ya citado en el marco teórico
-- del proyecto). REEMPLAZAR cuando se defina el instrumento real:
-- basta con insertar un nuevo registro en app.instrumentos con
-- activo = true (el anterior se puede desactivar) y sus preguntas en
-- app.preguntas. No requiere cambios de código en frontend ni backend.
-- =========================================================

INSERT INTO app.instrumentos (nombre, version, activo)
VALUES ('Inventario de Intereses Vocacionales RIASEC (demo)', '0.1-demo', true);

INSERT INTO app.preguntas (instrumento_id, dimension, enunciado, orden)
SELECT i.id, datos.dimension, datos.enunciado, datos.orden
FROM app.instrumentos i,
(VALUES
  ('REALISTA',     'Disfruto reparar o armar objetos con mis manos (electrónica, mecánica, carpintería).', 1),
  ('REALISTA',     'Prefiero actividades al aire libre o que impliquen trabajo físico antes que estar sentado todo el día.', 2),
  ('INVESTIGADOR', 'Me gusta entender por qué ocurren las cosas e investigar para resolver problemas complejos.', 3),
  ('INVESTIGADOR', 'Disfruto las materias de ciencias, matemáticas o el análisis de datos.', 4),
  ('ARTISTICO',    'Me gusta expresarme a través del arte, la música, la escritura o el diseño.', 5),
  ('ARTISTICO',    'Prefiero actividades donde pueda usar mi imaginación y crear algo original.', 6),
  ('SOCIAL',       'Disfruto ayudar, enseñar o escuchar a otras personas.', 7),
  ('SOCIAL',       'Me siento cómodo trabajando en equipo y conociendo gente nueva.', 8),
  ('EMPRENDEDOR',  'Me gusta liderar proyectos, convencer a otros o tomar decisiones.', 9),
  ('EMPRENDEDOR',  'Me interesa crear mi propio negocio o emprendimiento.', 10),
  ('CONVENCIONAL', 'Disfruto organizar información, seguir procedimientos claros y mantener el orden.', 11),
  ('CONVENCIONAL', 'Me siento cómodo trabajando con números, archivos o bases de datos.', 12)
) AS datos(dimension, enunciado, orden)
WHERE i.version = '0.1-demo';
