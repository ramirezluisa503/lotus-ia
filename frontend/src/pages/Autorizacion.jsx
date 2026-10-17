import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import { IconHeart, IconShield } from "../components/icons";
import { useAuth } from "../context/AuthContext";
import { mensajeDeError } from "../services/api";
import {
  obtenerEstadoAutorizacion,
  otorgarAsentimientoEstudiante,
  otorgarConsentimientoAcudiente,
} from "../services/consentimientoService";

function EstadoFila({ ok, etiqueta }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          ok ? "bg-mint/60 text-navy" : "bg-navy/10 text-navy/40"
        }`}
      >
        {ok ? "✓" : "–"}
      </span>
      <span className={ok ? "text-navy" : "text-navy/60"}>{etiqueta}</span>
    </div>
  );
}

function VistaEstudiante() {
  const navigate = useNavigate();
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cargando, setCargando] = useState(true);

  function cargarEstado() {
    setCargando(true);
    obtenerEstadoAutorizacion()
      .then(setEstado)
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }

  useEffect(cargarEstado, []);

  async function aceptar() {
    setError("");
    setEnviando(true);
    try {
      await otorgarAsentimientoEstudiante(true);
      cargarEstado();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) return <p className="text-sm text-navy/60">Cargando...</p>;

  return (
    <div className="space-y-5">
      <Alert tipo="error">{error}</Alert>

      <div className="space-y-2 rounded-xl bg-ice/60 p-4">
        <EstadoFila ok={estado?.consentimiento_otorgado} etiqueta="Autorización de tu acudiente" />
        <EstadoFila ok={estado?.asentimiento_otorgado} etiqueta="Tu aceptación" />
      </div>

      {!estado?.consentimiento_otorgado && (
        <Alert tipo="exito">
          Pídele a tu acudiente (madre, padre o tutor legal) que inicie sesión
          con su propia cuenta y autorice tu participación. Mientras tanto no
          podemos continuar.
        </Alert>
      )}

      {estado?.consentimiento_otorgado && !estado?.asentimiento_otorgado && (
        <div className="space-y-3 rounded-xl border border-navy/10 p-4">
          <p className="text-sm text-navy/70">
            Vamos a pedirte datos académicos, un cuestionario sobre tu entorno
            y un test de intereses. Esta información se usa únicamente para
            generar tu recomendación vocacional, se guarda sin tu nombre y
            puedes dejar de participar cuando quieras.
          </p>
          <Button variant="primary" className="w-full" onClick={aceptar} disabled={enviando}>
            {enviando ? "Guardando..." : "Acepto participar"}
          </Button>
        </div>
      )}

      {estado?.puede_continuar && (
        <div className="space-y-3">
          <Alert tipo="exito">
            ¡Todo listo! Ya tienes la autorización completa.
          </Alert>
          <Button variant="primary" className="w-full" onClick={() => navigate("/cuestionario")}>
            Empezar mi cuestionario
          </Button>
        </div>
      )}

      <Link to="/panel" className="block text-center text-sm font-medium text-teal hover:underline">
        Volver a mi panel
      </Link>
    </div>
  );
}

function VistaAcudiente() {
  const [respuesta, setRespuesta] = useState(null); // true | false | null
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function responder(aceptado) {
    setError("");
    setEnviando(true);
    try {
      await otorgarConsentimientoAcudiente(aceptado);
      setRespuesta(aceptado);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  if (respuesta === true) {
    return (
      <Alert tipo="exito">
        Autorizaste la participación de tu estudiante. Ya puede continuar con
        su cuestionario.
      </Alert>
    );
  }

  if (respuesta === false) {
    return (
      <Alert tipo="error">
        Registramos que no autorizas la participación por ahora. Puedes
        volver a esta página en cualquier momento para cambiarlo.
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert tipo="error">{error}</Alert>
      <div className="space-y-3 rounded-xl border border-navy/10 p-4 text-sm text-navy/70">
        <p>
          Tu estudiante quiere usar Lotus.IA, una herramienta orientativa que
          recomienda un área de conocimiento según su desempeño académico,
          sus intereses y su contexto socioeconómico.
        </p>
        <p>
          Vamos a pedirle datos académicos, un cuestionario sobre su entorno y
          un test de aptitudes. Esta información se guarda sin su nombre
          (seudonimizada), se usa solo para este fin, y puedes revocar tu
          autorización cuando quieras escribiéndonos.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => responder(false)} disabled={enviando}>
          No autorizo
        </Button>
        <Button variant="primary" onClick={() => responder(true)} disabled={enviando}>
          Autorizo
        </Button>
      </div>
    </div>
  );
}

export default function Autorizacion() {
  const { usuario } = useAuth();

  return (
    <div className="min-h-screen bg-ice">
      <Navbar />
      <main className="mx-auto max-w-lg px-6 py-16">
        <div className="rounded-3xl border border-navy/5 bg-white p-8 shadow-xl shadow-teal/10">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/40 text-teal">
            {usuario?.rol === "ACUDIENTE" ? (
              <IconHeart className="h-5.5 w-5.5" />
            ) : (
              <IconShield className="h-5.5 w-5.5" />
            )}
          </span>

          <h1 className="mt-4 text-xl font-semibold text-navy">
            {usuario?.rol === "ACUDIENTE" ? "Autorización de participación" : "Tu autorización"}
          </h1>
          <p className="mt-1 text-sm text-navy/60">
            {usuario?.rol === "ACUDIENTE"
              ? "Como acudiente, tu autorización es obligatoria antes de que el estudiante continúe."
              : "Necesitamos dos autorizaciones antes de empezar: la de tu acudiente y la tuya."}
          </p>

          <div className="mt-6">
            {usuario?.rol === "ACUDIENTE" ? <VistaAcudiente /> : <VistaEstudiante />}
          </div>
        </div>
      </main>
    </div>
  );
}
