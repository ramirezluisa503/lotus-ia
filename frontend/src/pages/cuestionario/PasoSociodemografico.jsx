import Field, { inputClasses } from "../../components/Field";

export default function PasoSociodemografico({ valores, onChange }) {
  return (
    <div className="space-y-4">
      <Field label="¿Cuántos años tienes?" id="edad">
        <input
          id="edad"
          type="number"
          required
          min={13}
          max={21}
          value={valores.edad ?? ""}
          onChange={(e) => onChange("edad", e.target.value)}
          className={inputClasses(false)}
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

      <Field label="¿Vives en zona urbana o rural?" id="zona">
        <select
          id="zona"
          required
          value={valores.zona ?? ""}
          onChange={(e) => onChange("zona", e.target.value)}
          className={inputClasses(false)}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          <option value="URBANA">Urbana</option>
          <option value="RURAL">Rural</option>
        </select>
      </Field>

      <Field label="Tu institución educativa es..." id="tipo_institucion">
        <select
          id="tipo_institucion"
          required
          value={valores.tipo_institucion ?? ""}
          onChange={(e) => onChange("tipo_institucion", e.target.value)}
          className={inputClasses(false)}
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          <option value="PUBLICA">Pública</option>
          <option value="PRIVADA">Privada</option>
        </select>
      </Field>
    </div>
  );
}
