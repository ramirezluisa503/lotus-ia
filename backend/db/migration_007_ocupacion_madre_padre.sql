-- Reemplaza el campo libre "ocupación principal en el hogar" por dos
-- campos separados, uno por cada progenitor, a pedido del profesor.
ALTER TABLE app.datos_socioeconomicos ADD COLUMN IF NOT EXISTS ocupacion_madre VARCHAR(40);
ALTER TABLE app.datos_socioeconomicos ADD COLUMN IF NOT EXISTS ocupacion_padre VARCHAR(40);
ALTER TABLE app.datos_socioeconomicos DROP COLUMN IF EXISTS ocupacion_hogar;
