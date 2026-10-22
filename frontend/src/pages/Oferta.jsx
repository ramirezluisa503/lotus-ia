import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Alert from "../components/Alert";
import Navbar from "../components/Navbar";
import { inputClasses } from "../components/Field";
import { IconHeart, IconHome } from "../components/icons";
import { mensajeDeError } from "../services/api";
import { listarAreas, listarBecas, listarCarreras } from "../services/ofertaService";

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

export default function Oferta() {
  const [searchParams] = useSearchParams();
  const [areas, setAreas] = useState([]);
  const [area, setArea] = useState(searchParams.get("area") ?? "");
  const [nivel, setNivel] = useState("");
  const [carreras, setCarreras] = useState([]);
  const [becas, setBecas] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    listarAreas()
      .then(setAreas)
      .catch((err) => setError(mensajeDeError(err)));
  }, []);

  useEffect(() => {
    setCargando(true);
    setError("");
    Promise.all([
      listarCarreras({ area: area || undefined, nivel: nivel || undefined }),
      listarBecas({ area: area || undefined }),
    ])
      .then(([c, b]) => {
        setCarreras(c);
        setBecas(b);
      })
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }, [area, nivel]);

  return (
    <div className="min-h-screen bg-ice">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-xl font-semibold text-navy">Oferta académica y becas</h1>
        <p className="mt-1 text-sm text-navy/60">
          Explora instituciones de Pereira y apoyos económicos disponibles.
          Esta información es orientativa y puede cambiar.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className={`${inputClasses(false)} w-auto`}
          >
            <option value="">Todas las áreas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.nombre}>
                {a.nombre}
              </option>
            ))}
          </select>

          <select
            value={nivel}
            onChange={(e) => setNivel(e.target.value)}
            className={`${inputClasses(false)} w-auto`}
          >
            <option value="">Todos los niveles</option>
            {Object.entries(NIVEL_ETIQUETA).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <Alert tipo="error">{error}</Alert>
        </div>

        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-navy/60">
            <IconHome className="h-4 w-4" />
            Carreras ({carreras.length})
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {!cargando && carreras.length === 0 && (
              <p className="text-sm text-navy/50">No encontramos carreras con esos filtros.</p>
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
              <p className="text-sm text-navy/50">No encontramos becas con esos filtros.</p>
            )}
            {becas.map((b) => (
              <TarjetaBeca key={b.id} beca={b} />
            ))}
          </div>
        </section>

        <p className="mt-8 rounded-xl border border-cyan-light bg-white px-4 py-3 text-xs text-navy/60">
          No garantizamos la disponibilidad de cupos ni el otorgamiento de las
          becas listadas. Confirma siempre con la institución o entidad
          correspondiente.
        </p>
      </main>
    </div>
  );
}
