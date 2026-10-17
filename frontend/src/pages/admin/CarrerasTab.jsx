import { useEffect, useState } from "react";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Field, { inputClasses } from "../../components/Field";
import { mensajeDeError } from "../../services/api";
import { actualizarCarrera, crearCarrera, listarCarrerasAdmin } from "../../services/adminService";
import { listarAreas } from "../../services/ofertaService";

const NIVELES = ["TECNICO_PROFESIONAL", "TECNOLOGICO", "UNIVERSITARIO"];
const MODALIDADES = ["PRESENCIAL", "VIRTUAL", "DISTANCIA", "HIBRIDA"];

function formVacio(institucionId, areaNombre) {
  return {
    institucion_id: institucionId ?? "",
    area: areaNombre ?? "",
    nombre: "",
    nivel_formacion: "UNIVERSITARIO",
    modalidad: "PRESENCIAL",
    duracion_semestres: "",
    costo_semestre: "",
    vigente: true,
  };
}

export default function CarrerasTab({ instituciones }) {
  const [lista, setLista] = useState([]);
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState(() => formVacio(instituciones[0]?.id, areas[0]?.nombre));
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    listarCarrerasAdmin().then(setLista).catch((err) => setError(mensajeDeError(err)));
  }
  useEffect(cargar, []);
  useEffect(() => {
    listarAreas().then(setAreas).catch((err) => setError(mensajeDeError(err)));
  }, []);

  function actualizar(campo, valor) {
    setForm((p) => ({ ...p, [campo]: valor }));
  }

  function editar(c) {
    setEditandoId(c.id);
    setForm({
      institucion_id: c.institucion_id,
      area: c.area,
      nombre: c.nombre,
      nivel_formacion: c.nivel_formacion,
      modalidad: c.modalidad,
      duracion_semestres: c.duracion_semestres ?? "",
      costo_semestre: c.costo_semestre ?? "",
      vigente: c.vigente,
    });
  }

  function cancelar() {
    setEditandoId(null);
    setForm(formVacio(instituciones[0]?.id, areas[0]?.nombre));
  }

  async function guardar(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      const payload = {
        ...form,
        institucion_id: Number(form.institucion_id),
        duracion_semestres: form.duracion_semestres ? Number(form.duracion_semestres) : null,
        costo_semestre: form.costo_semestre !== "" ? Number(form.costo_semestre) : null,
      };
      if (editandoId) {
        await actualizarCarrera(editandoId, payload);
      } else {
        await crearCarrera(payload);
      }
      cancelar();
      cargar();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form onSubmit={guardar} className="space-y-3 rounded-xl border border-navy/10 bg-white p-4 h-fit">
        <h3 className="text-sm font-semibold text-navy">{editandoId ? "Editar carrera" : "Nueva carrera"}</h3>
        <Alert tipo="error">{error}</Alert>

        <Field label="Institución" id="c-institucion">
          <select
            id="c-institucion"
            required
            value={form.institucion_id}
            onChange={(e) => actualizar("institucion_id", e.target.value)}
            className={inputClasses(false)}
          >
            <option value="" disabled>
              Selecciona
            </option>
            {instituciones.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Área de conocimiento" id="c-area">
          <select
            id="c-area"
            required
            value={form.area}
            onChange={(e) => actualizar("area", e.target.value)}
            className={inputClasses(false)}
          >
            <option value="" disabled>
              Selecciona
            </option>
            {areas.map((a) => (
              <option key={a.id} value={a.nombre}>
                {a.nombre}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Nombre de la carrera" id="c-nombre">
          <input
            id="c-nombre"
            required
            value={form.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
            className={inputClasses(false)}
          />
        </Field>

        <Field label="Nivel de formación" id="c-nivel">
          <select
            id="c-nivel"
            value={form.nivel_formacion}
            onChange={(e) => actualizar("nivel_formacion", e.target.value)}
            className={inputClasses(false)}
          >
            {NIVELES.map((n) => (
              <option key={n} value={n}>
                {n.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Modalidad" id="c-modalidad">
          <select
            id="c-modalidad"
            value={form.modalidad}
            onChange={(e) => actualizar("modalidad", e.target.value)}
            className={inputClasses(false)}
          >
            {MODALIDADES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Duración (semestres)" id="c-duracion">
          <input
            id="c-duracion"
            type="number"
            min={1}
            max={14}
            value={form.duracion_semestres}
            onChange={(e) => actualizar("duracion_semestres", e.target.value)}
            className={inputClasses(false)}
          />
        </Field>

        <Field label="Costo por semestre (COP)" id="c-costo">
          <input
            id="c-costo"
            type="number"
            min={0}
            value={form.costo_semestre}
            onChange={(e) => actualizar("costo_semestre", e.target.value)}
            className={inputClasses(false)}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-navy">
          <input
            type="checkbox"
            checked={form.vigente}
            onChange={(e) => actualizar("vigente", e.target.checked)}
          />
          Vigente (visible para estudiantes)
        </label>

        <div className="flex gap-2">
          <Button type="submit" variant="primary" className="flex-1" disabled={guardando}>
            {editandoId ? "Guardar cambios" : "Crear"}
          </Button>
          {editandoId && (
            <Button type="button" variant="secondary" onClick={cancelar}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy/10 text-xs uppercase text-navy/50">
            <tr>
              <th className="px-4 py-3">Carrera</th>
              <th className="px-4 py-3">Institución</th>
              <th className="px-4 py-3">Área</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((c) => (
              <tr key={c.id} className="border-b border-navy/5 last:border-0">
                <td className="px-4 py-3 font-medium text-navy">{c.nombre}</td>
                <td className="px-4 py-3 text-navy/60">{c.institucion}</td>
                <td className="px-4 py-3 text-navy/60">{c.area}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.vigente ? "bg-mint/40 text-navy" : "bg-navy/10 text-navy/50"
                    }`}
                  >
                    {c.vigente ? "Vigente" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => editar(c)} className="text-xs font-medium text-teal hover:underline">
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
