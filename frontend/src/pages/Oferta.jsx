import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import Navbar from "../components/Navbar";
import { IconHeart, IconHome, IconShield } from "../components/icons";
import { mensajeDeError } from "../services/api";
import { listarBecas, listarCarreras } from "../services/ofertaService";
import { obtenerHistorialRecomendaciones } from "../services/recomendacionService";

const NIVEL_ETIQUETA = {
  TECNICO_PROFESIONAL: "Técnico profesional",
  TECNOLOGICO: "Tecnológico",
  UNIVERSITARIO: "Universitario",
};

function formatearCosto(valor) {
  if (valor === null || valor === undefined) return "Costo no disponible";
  if (valor === 0) return "Gratuito";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function TarjetaCarrera({ carrera }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-teal">
        {NIVEL_ETIQUETA[carrera.nivel_formacion] ?? carrera.nivel_formacion}
      </p>
      <h3 className="mt-1 font-semibold text-navy">{carrera.nombre}</h3>
      <p className="mt-0.5 text-sm text-navy/60">{carrera.institucion}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/50">
        <span>{carrera.modalidad}</span>
        {carrera.duracion_semestres && <span>{carrera.duracion_semestres} semestres</span>}
        <span>{formatearCosto(carrera.costo_semestre)} / semestre</span>
      </div>
      {carrera.sitio_web && (
        <a
          href={carrera.sitio_web}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs font-medium text-teal hover:underline"
        >
          {carrera.costo_semestre === null
            ? "Consulta el costo en el sitio de la institución →"
            : "Ir al sitio de la institución →"}
        </a>
      )}
    </div>
  );
}

function TarjetaBeca({ beca }) {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-4">
      <h3 className="font-semibold text-navy">{beca.nombre}</h3>
      <p className="mt-0.5 text-sm text-navy/60">{beca.entidad}</p>
      {beca.descripcion && <p className="mt-2 text-sm text-navy/70">{beca.descripcion}</p>}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/50">
        {beca.cobertura && <span>Cobertura: {beca.cobertura}</span>}
        {beca.estrato_maximo && <span>Hasta estrato {beca.estrato_maximo}</span>}
        <span>{beca.fecha_cierre ? `Cierra: ${beca.fecha_cierre}` : "Sin fecha de cierre definida"}</span>
      </div>
      {beca.url && (
        <a
          href={beca.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-xs font-medium text-teal hover:underline"
        >
          Ver requisitos →
        </a>
      )}
    </div>
  );
}

function etiquetaRecomendacion(r) {
  return `${r.area} (${NIVEL_ETIQUETA[r.nivel_formacion] ?? r.nivel_formacion})`;
}

export default function Oferta() {
  const [recomendaciones, setRecomendaciones] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [becas, setBecas] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerHistorialRecomendaciones()
      .then((historial) => {
        setRecomendaciones(historial);
        if (historial.length === 0) {
          setCargando(false);
          return Promise.resolve();
        }
        return Promise.all([listarCarreras(), listarBecas()]).then(([c, b]) => {
          setCarreras(c);
          setBecas(b);
        });
      })
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }, []);

  const sinRecomendacionTodavia = !cargando && recomendaciones?.length === 0;

  // Áreas y niveles distintos entre todas las recomendaciones, para
  // mostrarle al estudiante en qué se basa lo que está viendo.
  const areasRecomendadas = recomendaciones
    ? [...new Map(recomendaciones.map((r) => [etiquetaRecomendacion(r), r])).values()]
    : [];

  return (
    <div className="min-h-screen bg-ice">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-xl font-semibold text-navy">Oferta académica y becas</h1>
        <p className="mt-1 text-sm text-navy/60">
          Instituciones de Pereira y apoyos económicos disponibles. Esta
          información es orientativa y puede cambiar.
        </p>

        <div className="mt-4">
          <Alert tipo="error">{error}</Alert>
        </div>

        {cargando ? (
          <p className="mt-8 text-sm text-navy/60">Cargando...</p>
        ) : sinRecomendacionTodavia ? (
          <div className="mt-8 rounded-xl border border-navy/10 bg-white p-6 text-center">
            <IconShield className="mx-auto h-6 w-6 text-navy/40" />
            <p className="mt-3 text-sm font-medium text-navy">
              Todavía no tienes una recomendación vocacional
            </p>
            <p className="mt-1 text-sm text-navy/60">
              Las carreras que te mostramos aquí dependen de tu recomendación.
              Completa tu cuestionario para verlas.
            </p>
            <Link to="/cuestionario" className="mt-3 inline-block text-sm font-medium text-teal hover:underline">
              Continuar mi cuestionario →
            </Link>
          </div>
        ) : (
          <>
            {areasRecomendadas.length > 0 && (
              <p className="mt-4 text-xs text-navy/50">
                Carreras según tu recomendación en: {areasRecomendadas.map((r) => etiquetaRecomendacion(r)).join(", ")}.
              </p>
            )}

            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-navy/60">
                <IconHome className="h-4 w-4" />
                Carreras ({carreras.length})
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {!cargando && carreras.length === 0 && (
                  <p className="text-sm text-navy/50">
                    Todavía no tenemos carreras registradas para tu recomendación.
                  </p>
                )}
                {carreras.map((c) => (
                  <TarjetaCarrera key={c.id} carrera={c} />
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-navy/60">
                <IconHeart className="h-4 w-4" />
                Becas y apoyos ({becas.length})
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {!cargando && becas.length === 0 && (
                  <p className="text-sm text-navy/50">No encontramos becas disponibles.</p>
                )}
                {becas.map((b) => (
                  <TarjetaBeca key={b.id} beca={b} />
                ))}
              </div>
            </section>

            <p className="mt-8 rounded-xl border border-cyan-light bg-white px-4 py-3 text-xs text-navy/60">
              No garantizamos la disponibilidad de cupos ni el otorgamiento de
              las becas listadas. Confirma siempre con la institución o
              entidad correspondiente.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
