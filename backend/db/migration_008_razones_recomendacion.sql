-- Guarda las razones del árbol de decisión como lista (JSON) además del
-- párrafo de `explicacion`, para que el frontend pueda mostrarlas una por
-- una en la vista tipo "historias" del resultado. Es opcional: las
-- recomendaciones anteriores quedan con NULL y usan solo el párrafo.
ALTER TABLE app.recomendaciones ADD COLUMN IF NOT EXISTS razones JSONB;
