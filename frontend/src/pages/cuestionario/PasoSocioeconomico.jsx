import Field, { inputClasses } from "../../components/Field";

const NIVELES_EDUCATIVOS = [
  "Ninguno",
  "Primaria",
  "Secundaria",
  "Técnico/Tecnólogo",
  "Universitario",
  "Posgrado",
];

function CampoSiNo({ etiqueta, valor, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-navy/15 px-3.5 py-2.5">
      <span className="text-sm text-navy">{etiqueta}</span>
      <div className="flex gap-2">
        {[
          { v: true, t: "Sí" },
          { v: false, t: "No" },
        ].map((op) => (
          <button
            key={String(op.v)}
            type="button"
            onClick={() => onChange(op.v)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              valor === op.v ? "bg-teal text-white" : "bg-ice text-navy/60 hover:bg-navy/10"
            }`}
          >
            {op.t}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function PasoSocioeconomico({ valores, onChange }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-navy/60">
        Esta información nos ayuda a que la recomendación sea realista para tu
        situación. Puedes dejar en blanco lo que prefieras no responder.
      </p>

      <Field label="Estrato (opcional)" id="estrato">
        <input
          id="estrato"
          type="number"
          min={0}
          max={6}
          value={valores.estrato ?? ""}
          onChange={(e) => onChange("estrato", e.target.value)}
          className={inputClasses(false)}
        />
      </Field>

      <Field label="Ingresos del hogar, en salarios mínimos (opcional)" id="rango_ingresos">
        <select
          id="rango_ingresos"
          value={valores.rango_ingresos ?? ""}
          onChange={(e) => onChange("rango_ingresos", e.target.value)}
          className={inputClasses(false)}
        >
          <option value="">Prefiero no responder</option>
          <option value="<1">Menos de 1</option>
          <option value="1-2">Entre 1 y 2</option>
          <option value="2-3">Entre 2 y 3</option>
          <option value="3-5">Entre 3 y 5</option>
          <option value=">5">Más de 5</option>
        </select>
      </Field>

      <Field label="Personas en tu hogar (opcional)" id="personas_hogar">
        <input
          id="personas_hogar"
          type="number"
          min={1}
          max={20}
          value={valores.personas_hogar ?? ""}
          onChange={(e) => onChange("personas_hogar", e.target.value)}
          className={inputClasses(false)}
        />
      </Field>

      <Field label="Educación de tu madre (opcional)" id="educacion_madre">
        <select
          id="educacion_madre"
          value={valores.educacion_madre ?? ""}
          onChange={(e) => onChange("educacion_madre", e.target.value)}
          className={inputClasses(false)}
        >
          <option value="">Prefiero no responder</option>
          {NIVELES_EDUCATIVOS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Educación de tu padre (opcional)" id="educacion_padre">
        <select
          id="educacion_padre"
          value={valores.educacion_padre ?? ""}
          onChange={(e) => onChange("educacion_padre", e.target.value)}
          className={inputClasses(false)}
        >
          <option value="">Prefiero no responder</option>
          {NIVELES_EDUCATIVOS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Ocupación principal en tu hogar (opcional)" id="ocupacion_hogar">
        <input
          id="ocupacion_hogar"
          type="text"
          value={valores.ocupacion_hogar ?? ""}
          onChange={(e) => onChange("ocupacion_hogar", e.target.value)}
          className={inputClasses(false)}
          placeholder="Ej. Comerciante, empleado, independiente..."
        />
      </Field>

      <div className="space-y-2">
        <CampoSiNo
          etiqueta="¿Tienes internet en casa?"
          valor={valores.tiene_internet}
          onChange={(v) => onChange("tiene_internet", v)}
        />
        <CampoSiNo
          etiqueta="¿Tienes computador en casa?"
          valor={valores.tiene_computador}
          onChange={(v) => onChange("tiene_computador", v)}
        />
        <CampoSiNo
          etiqueta="¿Recibes algún apoyo económico estatal?"
          valor={valores.recibe_apoyo_estatal}
          onChange={(v) => onChange("recibe_apoyo_estatal", v)}
        />
        <CampoSiNo
          etiqueta="¿Trabajas actualmente?"
          valor={valores.trabaja}
          onChange={(v) => onChange("trabaja", v)}
        />
      </div>
    </div>
  );
}
