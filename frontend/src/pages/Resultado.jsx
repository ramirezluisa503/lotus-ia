import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import { IconHeart, IconShield, IconSparkles } from "../components/icons";
import { mensajeDeError } from "../services/api";
import { obtenerPerfilPsicometrico } from "../services/cuestionarioService";
import { calificarRecomendacion } from "../services/encuestaService";
import { obtenerHistorialRecomendaciones } from "../services/recomendacionService";

const NIVEL_ETIQUETA = {
  TECNICO_PROFESIONAL: "Técnico profesional",
  TECNOLOGICO: "Tecnológico",
  UNIVERSITARIO: "Universitario",
};

const DIMENSION_ETIQUETA = {
  REALISTA: "Realista",
  INVESTIGADOR: "Investigador",
  ARTISTICO: "Artístico",
  SOCIAL: "Social",
  EMPRENDEDOR: "Emprendedor",
  CONVENCIONAL: "Convencional",
};

function PerfilPsicometrico({ dimensiones }) {
  if (!dimensiones || dimensiones.length === 0) return null;

  const dominantes = dimensiones
    .filter((d) => d.es_dominante)
    .map((d) => DIMENSION_ETIQUETA[d.dimension] ?? d.dimension)
    .join(" y ");

  return (
    <div className="mt-6 rounded-2xl border border-navy/10 p-4">
      <p className="text-sm font-medium text-navy">Tu perfil de intereses</p>
      <p className="mt-0.5 text-xs text-navy/50">
        Según tus respuestas al test, tu interés más marcado es: <strong>{dominantes}</strong>
      </p>
      <div className="mt-3 space-y-2">
        {dimensiones.map((d) => (
          <div key={d.dimension}>
            <div className="flex items-center justify-between text-xs">
              <span className={d.es_dominante ? "font-semibold text-navy" : "text-navy/60"}>
                {DIMENSION_ETIQUETA[d.dimension] ?? d.dimension}
              </span>
              <span className="text-navy/40">{d.promedio.toFixed(1)}/5</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ice">
              <div
                className={`h-full rounded-full ${d.es_dominante ? "bg-teal" : "bg-navy/20"}`}
                style={{ width: `${(d.promedio / 5) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EncuestaSatisfaccion({ recomendacionId, yaCalificada }) {
  const [calificacion, setCalificacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(yaCalificada);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    if (calificacion === 0) {
      setError("Selecciona una calificación de 1 a 5.");
      return;
    }
    setError("");
    setEnviando(true);
    try {
      await calificarRecomendacion({ recomendacionId, calificacion, comentario: comentario || undefined });
      setEnviado(true);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <Alert tipo="exito">¡Gracias por tu opinión! Nos ayuda a mejorar la recomendación.</Alert>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-navy/10 p-4">
      <p className="text-sm font-medium text-navy">¿Qué tan acertada sientes esta recomendación?</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCalificacion(n)}
            className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
              calificacion >= n
                ? "border-teal bg-teal text-white"
                : "border-navy/15 text-navy/40 hover:border-navy/30"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        rows={2}
        placeholder="Comentario opcional"
        className="w-full rounded-lg border border-navy/15 px-3.5 py-2.5 text-sm text-navy placeholder:text-navy/35 focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/40"
      />
      <Alert tipo="error">{error}</Alert>
      <Button variant="primary" className="w-full" onClick={enviar} disabled={enviando}>
        {enviando ? "Enviando..." : "Enviar calificación"}
      </Button>
    </div>
  );
}

export default function Resultado() {
  const [recomendacion, setRecomendacion] = useState(null);
  const [perfil, setPerfil] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      obtenerHistorialRecomendaciones().then((lista) => lista[0] ?? null),
      obtenerPerfilPsicometrico().catch(() => ({ dimensiones: [] })),
    ])
      .then(([primeraRecomendacion, perfilPsicometrico]) => {
        setRecomendacion(primeraRecomendacion);
        setPerfil(perfilPsicometrico.dimensiones);
      })
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="min-h-screen bg-ice">
      <Navbar />
      <main className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-3xl border border-navy/5 bg-white p-8 shadow-xl shadow-teal/10">
          {cargando && <p className="text-sm text-navy/60">Cargando tu resultado...</p>}

          {!cargando && error && <Alert tipo="error">{error}</Alert>}

          {!cargando && !error && !recomendacion && (
            <div className="text-center">
              <p className="text-sm text-navy/60">
                Todavía no tienes una recomendación generada.
              </p>
              <Link to="/cuestionario">
                <Button variant="primary" className="mt-4 w-full">
                  Completar mi cuestionario
                </Button>
              </Link>
            </div>
          )}

          {!cargando && recomendacion && (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/40 text-teal">
                <IconSparkles className="h-5.5 w-5.5" />
              </span>

              <p className="mt-4 text-xs font-medium uppercase tracking-wide text-navy/50">
                Tu área recomendada
              </p>
              <h1 className="mt-1 text-xl font-semibold text-navy">{recomendacion.area}</h1>
              <p className="text-sm text-navy/60">
                Nivel sugerido: {NIVEL_ETIQUETA[recomendacion.nivel_formacion] ?? recomendacion.nivel_formacion}
              </p>

              {recomendacion.probabilidad !== null && (
                <div className="mt-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-ice">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-teal to-mint"
                      style={{ width: `${Math.round(recomendacion.probabilidad * 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-navy/50">
                    Afinidad: {Math.round(recomendacion.probabilidad * 100)}%
                  </p>
                </div>
              )}

              <p className="mt-4 text-sm text-navy/70">{recomendacion.explicacion}</p>

              <PerfilPsicometrico dimensiones={perfil} />

              <p className="mt-4 flex items-start gap-2 text-xs text-navy/50">
                <IconShield className="mt-0.5 h-4 w-4 shrink-0" />
                {recomendacion.aviso}
              </p>

              <Link to={`/oferta?area=${encodeURIComponent(recomendacion.area)}`}>
                <Button variant="primary" className="mt-6 w-full">
                  <IconHeart className="h-4 w-4" />
                  Ver dónde estudiar y becas
                </Button>
              </Link>

              <div className="mt-6">
                <EncuestaSatisfaccion
                  recomendacionId={recomendacion.id}
                  yaCalificada={recomendacion.ya_calificada}
                />
              </div>

              <Link to="/panel" className="mt-6 block text-center text-sm font-medium text-teal hover:underline">
                Volver a mi panel
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
