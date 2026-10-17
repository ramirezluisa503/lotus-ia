import Field, { inputClasses } from "../../components/Field";

export const AREAS_ACADEMICAS = [
  "Matemáticas",
  "Lectura crítica",
  "Ciencias naturales",
  "Sociales y ciudadanas",
  "Inglés",
];

export default function PasoAcademico({ valores, onChange }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-navy/60">
        Cuéntanos tu desempeño en cada área (de 1.0 a 5.0), según tus últimos
        boletines o tu percepción general.
      </p>
      {AREAS_ACADEMICAS.map((area) => (
        <Field key={area} label={area} id={`nota-${area}`}>
          <input
            id={`nota-${area}`}
            type="number"
            required
            min={1}
            max={5}
            step={0.1}
            value={valores[area] ?? ""}
            onChange={(e) => onChange(area, e.target.value)}
            className={inputClasses(false)}
            placeholder="Ej. 4.2"
          />
        </Field>
      ))}
    </div>
  );
}
