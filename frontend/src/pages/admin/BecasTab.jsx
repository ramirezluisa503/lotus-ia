import { useEffect, useState } from "react";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Field, { inputClasses } from "../../components/Field";
import { mensajeDeError } from "../../services/api";
import { actualizarBeca, crearBeca, listarBecasAdmin } from "../../services/adminService";
import { listarAreas } from "../../services/ofertaService";

const VACIO = {
  institucion_id: "",
  nombre: "",
  entidad: "",
  descripcion: "",
  cobertura: "",
  estrato_maximo: "",
  url: "",
  fecha_cierre: "",
  vigente: true,
  areas: [],
};

export default function BecasTab({ instituciones }) {
  const [lista, setLista] = useState([]);
  const [areas, setAreas] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    listarBecasAdmin().then(setLista).catch((err) => setError(mensajeDeError(err)));
  }
  useEffect(cargar, []);
  useEffect(() => {
    listarAreas().then(setAreas).catch((err) => setError(mensajeDeError(err)));
  }, []);

  function actualizar(campo, valor) {
    setForm((p) => ({ ...p, [campo]: valor }));
  }

  function alternarArea(nombre) {
    setForm((p) => ({
      ...p,
      areas: p.areas.includes(nombre) ? p.areas.filter((a) => a !== nombre) : [...p.areas, nombre],
    }));
  }

  function editar(b) {
    setEditandoId(b.id);
    setForm({
      institucion_id: b.institucion_id ?? "",
      nombre: b.nombre,
      entidad: b.entidad,
      descripcion: b.descripcion ?? "",
      cobertura: b.cobertura ?? "",
      estrato_maximo: b.estrato_maximo ?? "",
      url: b.url ?? "",
      fecha_cierre: b.fecha_cierre ?? "",
      vigente: b.vigente,
      areas: b.areas,
    });
  }

  function cancelar() {
    setEditandoId(null);
    setForm(VACIO);
  }

  async function guardar(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      const payload = {
        ...form,
        institucion_id: form.institucion_id ? Number(form.institucion_id) : null,
        estrato_maximo: form.estrato_maximo ? Number(form.estrato_maximo) : null,
        descripcion: form.descripcion || null,
        cobertura: form.cobertura || null,
        url: form.url || null,
        fecha_cierre: form.fecha_cierre || null,
      };
      if (editandoId) {
        await actualizarBeca(editandoId, payload);
      } else {
        await crearBeca(payload);
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
        <h3 className="text-sm font-semibold text-navy">{editandoId ? "Editar beca" : "Nueva beca"}</h3>
        <Alert tipo="error">{error}</Alert>

        <Field label="Nombre" id="b-nombre">
          <input
            id="b-nombre"
            required
            value={form.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
            className={inputClasses(false)}
          />
        </Field>
        <Field label="Entidad" id="b-entidad">
          <input
            id="b-entidad"
            required
            value={form.entidad}
            onChange={(e) => actualizar("entidad", e.target.value)}
            className={inputClasses(false)}
          />
        </Field>
        <Field label="Institución (opcional, si es propia de una IES)" id="b-institucion">
          <select
            id="b-institucion"
            value={form.institucion_id}
            onChange={(e) => actualizar("institucion_id", e.target.value)}
            className={inputClasses(false)}
          >
            <option value="">Aplica a varias instituciones</option>
            {instituciones.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Descripción" id="b-descripcion">
          <textarea
            id="b-descripcion"
            rows={2}
            value={form.descripcion}
            onChange={(e) => actualizar("descripcion", e.target.value)}
            className={inputClasses(false)}
          />
        </Field>
        <Field label="Cobertura" id="b-cobertura">
          <input
            id="b-cobertura"
            value={form.cobertura}
            onChange={(e) => actualizar("cobertura", e.target.value)}
            className={inputClasses(false)}
          />
        </Field>
        <Field label="Estrato máximo" id="b-estrato">
          <input
            id="b-estrato"
            type="number"
            min={1}
            max={6}
            value={form.estrato_maximo}
            onChange={(e) => actualizar("estrato_maximo", e.target.value)}
            className={inputClasses(false)}
          />
        </Field>
        <Field label="URL de requisitos" id="b-url">
          <input
            id="b-url"
            value={form.url}
            onChange={(e) => actualizar("url", e.target.value)}
            className={inputClasses(false)}
          />
        </Field>
        <Field label="Fecha de cierre (opcional)" id="b-fecha">
          <input
            id="b-fecha"
            type="date"
            value={form.fecha_cierre}
            onChange={(e) => actualizar("fecha_cierre", e.target.value)}
            className={inputClasses(false)}
          />
        </Field>

        <Field label="Áreas a las que aplica">
          <div className="flex flex-wrap gap-1.5">
            {areas.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => alternarArea(a.nombre)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  form.areas.includes(a.nombre)
                    ? "border-teal bg-teal/10 text-teal"
                    : "border-navy/15 text-navy/50 hover:border-navy/30"
                }`}
              >
                {a.nombre}
              </button>
            ))}
          </div>
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
              <th className="px-4 py-3">Beca</th>
              <th className="px-4 py-3">Entidad</th>
              <th className="px-4 py-3">Áreas</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((b) => (
              <tr key={b.id} className="border-b border-navy/5 last:border-0">
                <td className="px-4 py-3 font-medium text-navy">{b.nombre}</td>
                <td className="px-4 py-3 text-navy/60">{b.entidad}</td>
                <td className="px-4 py-3 text-navy/60">{b.areas.length} área(s)</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      b.vigente ? "bg-mint/40 text-navy" : "bg-navy/10 text-navy/50"
                    }`}
                  >
                    {b.vigente ? "Vigente" : "Inactiva"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => editar(b)} className="text-xs font-medium text-teal hover:underline">
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
