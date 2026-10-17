import { useEffect, useState } from "react";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Field, { inputClasses } from "../../components/Field";
import { mensajeDeError } from "../../services/api";
import {
  actualizarInstitucion,
  crearInstitucion,
  listarInstitucionesAdmin,
} from "../../services/adminService";

const CARACTERES = [
  "UNIVERSIDAD",
  "INSTITUCION_UNIVERSITARIA",
  "INSTITUCION_TECNOLOGICA",
  "INSTITUCION_TECNICA_PROFESIONAL",
];

const VACIO = { nombre: "", caracter: "UNIVERSIDAD", sector: "PRIVADO", sitio_web: "", direccion: "" };

export default function InstitucionesTab() {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    listarInstitucionesAdmin().then(setLista).catch((err) => setError(mensajeDeError(err)));
  }
  useEffect(cargar, []);

  function actualizar(campo, valor) {
    setForm((p) => ({ ...p, [campo]: valor }));
  }

  function editar(institucion) {
    setEditandoId(institucion.id);
    setForm({ ...institucion, sitio_web: institucion.sitio_web ?? "", direccion: institucion.direccion ?? "" });
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
      const payload = { ...form, sitio_web: form.sitio_web || null, direccion: form.direccion || null };
      if (editandoId) {
        await actualizarInstitucion(editandoId, payload);
      } else {
        await crearInstitucion(payload);
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
        <h3 className="text-sm font-semibold text-navy">
          {editandoId ? "Editar institución" : "Nueva institución"}
        </h3>
        <Alert tipo="error">{error}</Alert>

        <Field label="Nombre" id="i-nombre">
          <input
            id="i-nombre"
            required
            value={form.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
            className={inputClasses(false)}
          />
        </Field>
        <Field label="Carácter" id="i-caracter">
          <select
            id="i-caracter"
            value={form.caracter}
            onChange={(e) => actualizar("caracter", e.target.value)}
            className={inputClasses(false)}
          >
            {CARACTERES.map((c) => (
              <option key={c} value={c}>
                {c.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sector" id="i-sector">
          <select
            id="i-sector"
            value={form.sector}
            onChange={(e) => actualizar("sector", e.target.value)}
            className={inputClasses(false)}
          >
            <option value="PRIVADO">Privado</option>
            <option value="OFICIAL">Oficial</option>
          </select>
        </Field>
        <Field label="Sitio web" id="i-sitio">
          <input
            id="i-sitio"
            value={form.sitio_web}
            onChange={(e) => actualizar("sitio_web", e.target.value)}
            className={inputClasses(false)}
          />
        </Field>
        <Field label="Dirección" id="i-direccion">
          <input
            id="i-direccion"
            value={form.direccion}
            onChange={(e) => actualizar("direccion", e.target.value)}
            className={inputClasses(false)}
          />
        </Field>

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
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Carácter</th>
              <th className="px-4 py-3">Sector</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((i) => (
              <tr key={i.id} className="border-b border-navy/5 last:border-0">
                <td className="px-4 py-3 font-medium text-navy">{i.nombre}</td>
                <td className="px-4 py-3 text-navy/60">{i.caracter.replaceAll("_", " ")}</td>
                <td className="px-4 py-3 text-navy/60">{i.sector}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => editar(i)} className="text-xs font-medium text-teal hover:underline">
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
