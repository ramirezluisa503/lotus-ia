-- El profesor pidió que la edad del estudiante no tenga tope máximo, solo
-- un mínimo (mayor de 10 años), en vez del rango fijo 13-21.
ALTER TABLE app.estudiantes DROP CONSTRAINT IF EXISTS estudiantes_edad_check;
ALTER TABLE app.estudiantes ADD CONSTRAINT estudiantes_edad_check CHECK (edad > 10);
