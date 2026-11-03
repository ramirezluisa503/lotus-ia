import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Field, { inputClasses } from "../components/Field";
import Navbar from "../components/Navbar";
import { IconHeart, IconSparkles } from "../components/icons";
import { useAuth } from "../context/AuthContext";
import { mensajeDeError } from "../services/api";
import { vincularEstudiante } from "../services/authService";
import { obtenerEstudiantesACargo } from "../services/consentimientoService";

const ROL_ETIQUETA = { ESTUDIANTE: "Estudiante", ACUDIENTE: "Acudiente", ADMINISTRADOR: "Administrador" };
const PARENTESCOS = [
  { valor: "MADRE", etiqueta: "Madre" },
  { valor: "PADRE", etiqueta: "Padre" },
  { valor: "TUTOR_LEGAL", etiqueta: "Tutor legal" },
];

function TarjetaEstudianteVinculado({ estudiante }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-navy/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-navy">{estudiante.nombre}</p>
        <p className="text-xs text-navy/50">
          {estudiante.correo} · Documento: {estudiante.documento || "sin registrar"} ·{" "}
          {PARENTESCOS.find((p) => p.valor === estudiante.parentesco)?.etiqueta ?? estudiante.parentesco}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            estudiante.consentimiento_otorgado ? "bg-mint/50 text-navy" : "bg-navy/5 text-navy/50"
          }`}
        >
          {estudiante.consentimiento_otorgado ? "✓ Autorizado" : "Pendiente"}
        </span>
        {!estudiante.consentimiento_otorgado && (
          <Link to="/autorizacion" className="text-xs font-medium text-teal hover:underline">
            Ir a autorizar →
          </Link>
        )}
      </div>
    </div>
  );
}

function PerfilAcudiente({ usuario }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [correoEstudiante, setCorreoEstudiante] = useState("");
  const [parentesco, setParentesco] = useState("MADRE");
  const [enviando, setEnviando] = useState(false);
  const [mensajeVinculo, setMensajeVinculo] = useState("");
  const [errorVinculo, setErrorVinculo] = useState("");

  function cargar() {
    setCargando(true);
    obtenerEstudiantesACargo()
      .then(setEstudiantes)
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }

  useEffect(cargar, []);

  async function manejarVincular(e) {
    e.preventDefault();
    setErrorVinculo("");
    setMensajeVinculo("");

    if (!correoEstudiante || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoEstudiante)) {
      setErrorVinculo("Ingresa un correo válido del estudiante.");
      return;
    }

    setEnviando(true);
    try {
      await vincularEstudiante({ correo_estudiante: correoEstudiante, parentesco });
      setMensajeVinculo("Estudiante vinculado correctamente. Ya puedes autorizarlo.");
      setCorreoEstudiante("");
      cargar();
    } catch (err) {
      setErrorVinculo(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-navy/5 bg-white p-8 shadow-xl shadow-teal/10">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/40 text-teal">
          <IconHeart className="h-5.5 w-5.5" />
        </span>

        <h1 className="mt-4 text-xl font-semibold text-navy">Mi perfil</h1>

        <dl className="mt-4 space-y-2 rounded-xl bg-ice/60 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy/60">Correo</dt>
            <dd className="font-medium text-navy">{usuario?.correo}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy/60">Rol</dt>
            <dd className="font-medium text-navy">{ROL_ETIQUETA[usuario?.rol] ?? usuario?.rol}</dd>
          </div>
        </dl>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-navy/50">
          Estudiantes a tu cargo {!cargando && `(${estudiantes.length})`}
        </h2>

        <div className="mt-3 space-y-3">
          <Alert tipo="error">{error}</Alert>
          {cargando ? (
            <p className="text-sm text-navy/60">Cargando...</p>
          ) : estudiantes.length === 0 ? (
            <p className="text-sm text-navy/60">Todavía no tienes ningún estudiante vinculado.</p>
          ) : (
            estudiantes.map((est) => (
              <TarjetaEstudianteVinculado key={est.estudiante_usuario_id} estudiante={est} />
            ))
          )}
        </div>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-navy/50">
          Vincular otro estudiante
        </h2>
        <p className="mt-1 text-xs text-navy/50">
          Si tienes más de un estudiante a tu cargo (por ejemplo, otro hijo o hija), agrégalo
          aquí con su correo — no necesitas crear otra cuenta.
        </p>

        <form onSubmit={manejarVincular} className="mt-3 space-y-3">
          <Alert tipo="error">{errorVinculo}</Alert>
          {mensajeVinculo && <Alert tipo="exito">{mensajeVinculo}</Alert>}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Field label="Correo del estudiante" id="correoEstudianteNuevo">
              <input
                id="correoEstudianteNuevo"
                type="email"
                value={correoEstudiante}
                onChange={(e) => setCorreoEstudiante(e.target.value)}
                className={inputClasses(false)}
                placeholder="Debe tener su cuenta creada"
              />
            </Field>
            <Field label="Parentesco" id="parentescoNuevo">
              <select
                id="parentescoNuevo"
                value={parentesco}
                onChange={(e) => setParentesco(e.target.value)}
                className={inputClasses(false)}
              >
                {PARENTESCOS.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.etiqueta}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Button type="submit" variant="primary" disabled={enviando}>
            {enviando ? "Vinculando..." : "Vincular estudiante"}
          </Button>
        </form>

        <Link to="/panel" className="mt-8 block text-center text-sm font-medium text-teal hover:underline">
          Volver a mi panel
        </Link>
      </div>
    </main>
  );
}

export default function Perfil() {
  const { usuario } = useAuth();

  if (usuario && usuario.rol !== "ACUDIENTE") {
    // El perfil del estudiante todavía no está construido.
    return <Navigate to="/panel" replace />;
  }

  return (
    <div className="min-h-screen bg-ice">
      <Navbar />
      {usuario?.rol === "ACUDIENTE" ? (
        <PerfilAcudiente usuario={usuario} />
      ) : (
        <main className="mx-auto max-w-3xl px-6 py-12 text-center text-sm text-navy/60">
          <IconSparkles className="mx-auto h-6 w-6" />
          Cargando...
        </main>
      )}
    </div>
  );
}
