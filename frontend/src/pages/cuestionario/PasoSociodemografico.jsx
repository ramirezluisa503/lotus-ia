import Field, { inputClasses } from "../../components/Field";

const CARACTERES = [
  { v: "ACADEMICO", t: "Académico" },
  { v: "TECNICO", t: "Técnico" },
  { v: "TECNICO_ACADEMICO", t: "Técnico/Académico" },
  { v: "NO_APLICA", t: "No aplica" },
];

const JORNADAS = [
  { v: "MANANA", t: "Mañana" },
  { v: "TARDE", t: "Tarde" },
  { v: "NOCHE", t: "Noche" },
  { v: "COMPLETA", t: "Completa" },
  { v: "SABATINA", t: "Sabatina" },
  { v: "UNICA", t: "Única" },
];

export default function PasoSociodemografico({ valores, errores = {}, onChange }) {
  return (
    <div className="space-y-4">
      <Field label="¿Cuántos años tienes?" id="edad" error={errores.edad}>
        <input
          id="edad"
          type="number"
          required
          min={13}
          max={21}
          value={valores.edad ?? ""}
          onChange={(e) => onChange("edad", e.target.value)}
          className={inputClasses(Boolean(errores.edad))}
          placeholder="Ej. 16"
        />
      </Field>

      <Field label="Género (opcional)" id="genero">
        <select
          id="genero"
          value={valores.genero ?? ""}
          onChange={(e) => onChange("genero", e.target.value)}
          className={inputClasses(false)}
        >
          <option value="">Prefiero no decir</option>
          <option value="FEMENINO">Femenino</option>
          <option value="MASCULINO">Masculino</option>
          <option value="OTRO">Otro</option>
        </select>
      </Field>

      <Field label="¿Vives en zona urbana o rural?" id="zona" error={errores.zona}>
        <select
          id="zona"
          required
          value={valores.zona ?? ""}
          onChange={(e) => onChange("zona", e.target.value)}
          className={inputClasses(Boolean(errores.zona))}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          <option value="URBANA">Urbana</option>
          <option value="RURAL">Rural</option>
        </select>
      </Field>

      <Field label="Tu institución educativa es..." id="tipo_institucion" error={errores.tipo_institucion}>
        <select
          id="tipo_institucion"
          required
          value={valores.tipo_institucion ?? ""}
          onChange={(e) => onChange("tipo_institucion", e.target.value)}
          className={inputClasses(Boolean(errores.tipo_institucion))}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          <option value="PUBLICA">Pública</option>
          <option value="PRIVADA">Privada</option>
        </select>
      </Field>

      <Field label="Carácter de tu colegio" id="cole_caracter" error={errores.cole_caracter}>
        <select
          id="cole_caracter"
          required
          value={valores.cole_caracter ?? ""}
          onChange={(e) => onChange("cole_caracter", e.target.value)}
          className={inputClasses(Boolean(errores.cole_caracter))}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          {CARACTERES.map((c) => (
            <option key={c.v} value={c.v}>
              {c.t}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Jornada de tu colegio" id="cole_jornada" error={errores.cole_jornada}>
        <select
          id="cole_jornada"
          required
          value={valores.cole_jornada ?? ""}
          onChange={(e) => onChange("cole_jornada", e.target.value)}
          className={inputClasses(Boolean(errores.cole_jornada))}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          {JORNADAS.map((j) => (
            <option key={j.v} value={j.v}>
              {j.t}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}
