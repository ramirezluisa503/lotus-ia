import Field, { inputClasses } from "../../components/Field";

export const AREAS_ACADEMICAS = [
  "Matemáticas",
  "Lectura crítica",
  "Ciencias naturales",
  "Sociales y ciudadanas",
  "Inglés",
];

const NIVELES_INGLES = ["A-", "A1", "A2", "B1", "B+"];

export default function PasoAcademico({ valores, onChange }) {
  const esSimulacro = Boolean(valores.es_simulacro);

  return (
    <div className="space-y-4">
      <p className="text-sm text-navy/60">
        {esSimulacro
          ? "Ingresa los resultados de tu simulacro o pre-ICFES más reciente (del 0 al 100 por materia)."
          : "Ingresa tus resultados del ICFES Saber 11 (los puedes ver en tu registro de resultados, del 0 al 100 por materia)."}
      </p>

      <label className="flex items-start gap-2 rounded-lg border border-navy/15 bg-navy/2 px-3 py-2.5 text-sm text-navy/70">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={esSimulacro}
          onChange={(e) => onChange("es_simulacro", e.target.checked)}
        />
        <span>
          Aún no tengo el resultado oficial del ICFES (voy en grado 10 o
          todavía no me lo entregan) y quiero usar mi puntaje de simulacro o
          pre-ICFES mientras tanto.
        </span>
      </label>

      {AREAS_ACADEMICAS.map((area) => (
        <Field key={area} label={`${area} (0-100)`} id={`nota-${area}`}>
          <input
            id={`nota-${area}`}
            type="number"
            required
            min={0}
            max={100}
            value={valores[area] ?? ""}
            onChange={(e) => onChange(area, e.target.value)}
            className={inputClasses(false)}
            placeholder="Ej. 65"
          />
        </Field>
      ))}

      <Field label="Puntaje global ICFES (0-500)" id="puntaje-global">
        <input
          id="puntaje-global"
          type="number"
          required
          min={0}
          max={500}
          value={valores.puntaje_global_icfes ?? ""}
          onChange={(e) => onChange("puntaje_global_icfes", e.target.value)}
          className={inputClasses(false)}
          placeholder="Ej. 310"
        />
      </Field>

      <Field label="Nivel de inglés (resultado ICFES)" id="desempeno-ingles">
        <select
          id="desempeno-ingles"
          required
          value={valores.desempeno_ingles ?? ""}
          onChange={(e) => onChange("desempeno_ingles", e.target.value)}
          className={inputClasses(false)}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          {NIVELES_INGLES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
