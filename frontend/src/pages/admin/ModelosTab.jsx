import { useEffect, useState } from "react";
import Alert from "../../components/Alert";
import { mensajeDeError } from "../../services/api";
import { activarModelo, listarModelos } from "../../services/adminService";

export default function ModelosTab() {
  const [lista, setLista] = useState([]);
  const [error, setError] = useState("");

  function cargar() {
    listarModelos().then(setLista).catch((err) => setError(mensajeDeError(err)));
  }
  useEffect(cargar, []);

  async function activar(id) {
    setError("");
    try {
      await activarModelo(id);
      cargar();
    } catch (err) {
      setError(mensajeDeError(err));
    }
  }

  return (
    <div className="space-y-4">
      <Alert tipo="error">{error}</Alert>
      <p className="text-sm text-navy/60">
        El modelo activo es el que usa <code>RecomendacionService</code> para
        generar resultados. Solo puede haber uno activo a la vez.
      </p>
      <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy/10 text-xs uppercase text-navy/50">
            <tr>
              <th className="px-4 py-3">Versión</th>
              <th className="px-4 py-3">Algoritmo</th>
              <th className="px-4 py-3">Exactitud</th>
              <th className="px-4 py-3">Entrenado</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((m) => (
              <tr key={m.id} className="border-b border-navy/5 last:border-0">
                <td className="px-4 py-3 font-medium text-navy">{m.version}</td>
                <td className="px-4 py-3 text-navy/60">{m.algoritmo}</td>
                <td className="px-4 py-3 text-navy/60">
                  {m.exactitud !== null ? `${(m.exactitud * 100).toFixed(1)}%` : "—"}
                </td>
                <td className="px-4 py-3 text-navy/60">
                  {new Date(m.entrenado_en).toLocaleDateString("es-CO")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.activo ? "bg-mint/40 text-navy" : "bg-navy/10 text-navy/50"
                    }`}
                  >
                    {m.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {!m.activo && (
                    <button onClick={() => activar(m.id)} className="text-xs font-medium text-teal hover:underline">
                      Activar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
