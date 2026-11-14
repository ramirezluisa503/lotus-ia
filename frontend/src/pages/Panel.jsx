import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import {
  IconArrowRight,
  IconBell,
  IconBrain,
  IconHeart,
  IconHome,
  IconShield,
} from "../components/icons";
import { useAuth } from "../context/AuthContext";
import {
  obtenerEstadoAutorizacion,
  obtenerEstudiantesACargo,
} from "../services/consentimientoService";
import { listarBecas } from "../services/ofertaService";

const PARENTESCO_ETIQUETA = { MADRE: "Madre", PADRE: "Padre", TUTOR_LEGAL: "Tutor legal" };

// Tarjetas de "Lo que necesitas saber": mismo estilo que las de la página de
// inicio (oscura · blanca · oscura).
const INFO_ACUDIENTE = [
  {
    icon: IconBrain,
    title: "¿Qué es Lotus.IA?",
    description:
      "Un proyecto piloto de orientación vocacional para estudiantes de grado 10° y 11° en Pereira. A partir del desempeño académico, un test de intereses y el contexto del estudiante, una inteligencia artificial sugiere un área de conocimiento y un nivel de formación acordes a su perfil.",
    oscura: true,
  },
  {
    icon: IconShield,
    title: "¿Por qué se necesita tu autorización?",
    description:
      "Como el estudiante a tu cargo es menor de edad, la Ley 1581 de 2012 exige el consentimiento de madre, padre o tutor legal antes de usar su información. Sin tu autorización, el proceso queda bloqueado y el estudiante no puede avanzar al cuestionario.",
  },
  {
    icon: IconHome,
    title: "¿Cómo se protegen sus datos?",
    description:
      "El nombre y el documento del estudiante se cifran y se guardan separados de sus respuestas académicas: la inteligencia artificial nunca ve su identidad, solo un código anónimo. Puedes cambiar tu decisión y revocar la autorización cuando quieras.",
    oscura: true,
  },
];

// Línea de pasos del proceso de un estudiante, vista por su acudiente.
// Si `estudiante` es null (aún no hay ninguno vinculado) se muestran los
// pasos sin completar, a modo de explicación.
function ProgresoEstudiante({ estudiante, conNombre = false }) {
  const etapa = estudiante?.estado_proceso;
  const autorizado = Boolean(estudiante?.puede_continuar);

  const pasos = [
    {
      title: "Tu autorización",
      description: "Das tu consentimiento como acudiente.",
      hecho: Boolean(estudiante?.consentimiento_otorgado),
    },
    {
      title: "Su aceptación",
      description: "El estudiante confirma que quiere participar.",
      hecho: Boolean(estudiante?.asentimiento_otorgado),
    },
    {
      title: "Cuestionario",
      description: "Responde sus datos académicos, su entorno y sus intereses.",
      hecho: etapa === "DATOS_COMPLETOS" || etapa === "RECOMENDADO",
      bloqueado: !autorizado,
    },
    {
      title: "Recomendación",
      description: "Recibe su área y nivel de formación sugeridos.",
      hecho: etapa === "RECOMENDADO",
      bloqueado: !autorizado,
    },
  ];
  const siguiente = estudiante ? pasos.find((p) => !p.hecho) : null;
  const hechos = pasos.filter((p) => p.hecho).length;

  return (
    <div className="mt-12">
      {conNombre && (
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-teal to-navy text-sm font-bold text-white">
            {(estudiante.nombre || estudiante.correo).charAt(0).toUpperCase()}
          </span>
          <p className="font-semibold text-navy">{estudiante.nombre}</p>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-teal">
            {hechos} de {pasos.length}
          </span>
        </div>
      )}
      <div className="relative grid gap-8 sm:grid-cols-4">
        <div className="absolute left-[12.5%] right-[12.5%] top-5 hidden h-px bg-navy/10 sm:block" />
        {pasos.map((paso, index) => {
          const esSiguiente = paso === siguiente;
          const tenue = paso.bloqueado && !paso.hecho;
          return (
            <div key={paso.title} className={`group relative text-center ${tenue ? "opacity-55" : ""}`}>
              <span
                className={`relative z-10 mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-semibold shadow-md transition-[color,box-shadow] duration-500 ${
                  paso.hecho
                    ? "bg-mint text-navy shadow-mint/60"
                    : "bg-linear-to-br from-teal to-navy text-white shadow-teal/30 group-hover:text-navy"
                } ${esSiguiente ? "ring-4 ring-mint/50" : ""}`}
              >
                {!paso.hecho && (
                  <span className="absolute inset-0 bg-mint opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                )}
                <span className="relative">{paso.hecho ? "✓" : index + 1}</span>
              </span>
              <h3 className="mt-4 font-semibold text-navy">{paso.title}</h3>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-navy/65">{paso.description}</p>
              {paso.hecho ? (
                <p className="mt-2 text-xs font-medium text-teal">Completado</p>
              ) : esSiguiente && index === 0 ? (
                <Link to="/autorizacion" className="mt-2 inline-block text-xs font-semibold text-teal hover:underline">
                  Autorizar ahora →
                </Link>
              ) : esSiguiente ? (
                <p className="mt-2 text-xs font-medium text-teal">En curso</p>
              ) : tenue ? (
                <p className="mt-2 text-xs font-medium text-teal">Se desbloquea con la autorización</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Tarjeta que queda montada sobre el borde de la foto: muestra cada
// estudiante a cargo y si ya tiene la autorización.
function AvisoEstudiantesACargo({ estudiantes, cargando }) {
  if (cargando) return null;

  const pendientes = estudiantes.filter((e) => !e.consentimiento_otorgado).length;
  const hayPendientes = pendientes > 0;

  if (estudiantes.length === 0) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-navy/5 bg-white px-5 py-4 shadow-xl shadow-teal/10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ice text-teal">
            <IconHeart className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-navy">Todavía no tienes estudiantes vinculados</p>
            <p className="text-sm text-navy/60">Vincula a tu estudiante con su correo desde tu perfil.</p>
          </div>
        </div>
        <Link
          to="/perfil"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy"
        >
          Vincular estudiante
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-navy/5 bg-white px-5 py-4 shadow-xl shadow-teal/10 sm:px-6">
      {hayPendientes && <span className="absolute inset-y-0 left-0 w-1.5 bg-linear-to-b from-mint to-teal" />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          {hayPendientes ? (
            <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ice text-teal">
              <IconBell className="h-5 w-5" />
              <span className="absolute right-0.5 top-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-teal ring-2 ring-white" />
              </span>
            </span>
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint text-lg font-bold text-navy">
              ✓
            </span>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">
              {hayPendientes ? "Pendiente" : "Todo al día"}
            </p>
            <p className="mt-0.5 font-semibold text-navy">
              {hayPendientes
                ? pendientes === 1
                  ? "Un estudiante espera tu autorización"
                  : `${pendientes} estudiantes esperan tu autorización`
                : "Ya autorizaste a tus estudiantes"}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {estudiantes.map((e) => (
                <li
                  key={e.estudiante_usuario_id}
                  className={`inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm ${
                    e.consentimiento_otorgado ? "bg-mint/40 text-navy" : "bg-ice text-navy"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      e.consentimiento_otorgado ? "bg-mint text-navy" : "bg-linear-to-br from-teal to-navy text-white"
                    }`}
                  >
                    {e.consentimiento_otorgado ? "✓" : (e.nombre || e.correo).charAt(0).toUpperCase()}
                  </span>
                  <span className="font-medium">{e.nombre}</span>
                  <span className="text-xs text-navy/50">
                    {PARENTESCO_ETIQUETA[e.parentesco] ?? e.parentesco}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Link
          to="/autorizacion"
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
            hayPendientes ? "bg-teal text-white hover:bg-navy" : "border border-navy/15 text-navy hover:bg-ice"
          }`}
        >
          {hayPendientes ? "Autorizar ahora" : "Revisar mi autorización"}
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function PanelAcudiente() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerEstudiantesACargo()
      .then(setEstudiantes)
      .catch(() => setEstudiantes([]))
      .finally(() => setCargando(false));
  }, []);

  const totalEstudiantes = estudiantes.length;
  const pendientes = estudiantes.filter((e) => !e.consentimiento_otorgado).length;
  const yaAutorizo = totalEstudiantes > 0 && pendientes === 0;

  return (
    <div className="min-h-screen bg-ice">
      <Navbar />

      {/* Portada con foto, como en la página de inicio */}
      <section className="relative overflow-hidden bg-navy">
        <img
          src="/img/panel-acudiente.jpg"
          alt="Dos personas revisando juntas un computador y un celular"
          className="absolute inset-0 h-full w-full object-cover object-[60%_35%]"
        />
        <div className="absolute inset-0 bg-linear-to-r from-navy/90 via-navy/65 to-navy/10" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pb-20 sm:pt-12">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            Acompaña a tu estudiante <span className="text-mint">en su decisión vocacional.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
            Aquí puedes entender de qué trata Lotus.IA antes de autorizar la
            participación del estudiante a tu cargo.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Link
              to="/autorizacion"
              className="inline-flex items-center gap-2 rounded-full bg-mint px-7 py-3.5 text-base font-medium text-navy shadow-lg shadow-navy/30 transition-colors hover:bg-white"
            >
              {yaAutorizo ? "Revisar mi autorización" : "Autorizar participación"}
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <a href="#progreso" className="text-base font-medium text-white/90 underline-offset-4 hover:underline">
              Ver su progreso
            </a>
          </div>
        </div>
      </section>

      {/* Estudiantes a cargo: montado sobre el borde de la foto */}
      <div className="relative z-10 mx-auto -mt-12 max-w-5xl px-6">
        <AvisoEstudiantesACargo estudiantes={estudiantes} cargando={cargando} />
      </div>

      {/* Progreso de cada estudiante, igual que "Tu proceso, paso a paso" del estudiante */}
      <section id="progreso" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
        <h2 className="text-center text-2xl font-semibold text-navy sm:text-3xl">
          {totalEstudiantes > 1 ? "El proceso de tus estudiantes" : "El proceso de tu estudiante"}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-navy/70">
          Aquí ves en qué etapa va. Las respuestas del cuestionario son privadas
          del estudiante.
        </p>

        {totalEstudiantes === 0 ? (
          <ProgresoEstudiante estudiante={null} />
        ) : (
          estudiantes.map((e) => (
            <ProgresoEstudiante key={e.estudiante_usuario_id} estudiante={e} conNombre={totalEstudiantes > 1} />
          ))
        )}
      </section>

      {/* Qué necesitas saber: queda al final como información de consulta */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-semibold text-navy sm:text-3xl">
            Lo que necesitas saber
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-navy/70">
            Tu rol es breve pero importante: tu autorización es lo único que
            falta para que el estudiante pueda empezar.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {INFO_ACUDIENTE.map(({ icon: Icon, title, description, oscura }) => (
              <div key={title} className="group transition-transform duration-300 hover:-translate-y-2">
                <div
                  className={`h-full rounded-2xl p-6 shadow-sm transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-teal/15 ${
                    oscura ? "bg-linear-to-br from-teal to-navy" : "bg-ice/70"
                  }`}
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                      oscura ? "bg-white/10 text-mint" : "bg-mint/40 text-teal"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className={`mt-5 font-bold ${oscura ? "text-white" : "text-navy"}`}>{title}</h3>
                  <p className={`mt-2 text-sm ${oscura ? "text-white/80" : "text-navy/70"}`}>{description}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-navy/55">
            <IconShield className="h-4 w-4 shrink-0" />
            Lotus.IA es orientativa: no reemplaza el acompañamiento del orientador escolar ni garantiza cupos o becas.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Fila de la notificación pendiente: un círculo verde con ✓ si ya está listo,
// o uno vacío si todavía falta.
function ItemPendiente({ listo, children }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
          listo ? "bg-mint text-navy" : "border-2 border-navy/20 text-transparent"
        }`}
      >
        ✓
      </span>
      <span className={listo ? "text-navy/50 line-through" : "text-navy"}>{children}</span>
    </li>
  );
}

function AvisoAutorizacion({ estado }) {
  if (!estado) return null;

  if (estado.puede_continuar) {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-mint bg-white p-5 shadow-xl shadow-teal/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint text-lg font-bold text-navy">
            ✓
          </span>
          <div>
            <p className="font-semibold text-navy">Tu autorización está completa</p>
            <p className="text-sm text-navy/60">Ya puedes responder tu cuestionario y recibir tu recomendación.</p>
          </div>
        </div>
        <Link
          to="/cuestionario"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy"
        >
          Ir a mi cuestionario
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-navy/5 bg-white px-5 py-4 shadow-xl shadow-teal/10 sm:px-6">
      {/* Franja de color a la izquierda, como en una notificación */}
      <span className="absolute inset-y-0 left-0 w-1.5 bg-linear-to-b from-mint to-teal" />
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ice text-teal">
            <IconBell className="h-5 w-5" />
            {/* Punto que "late" para llamar la atención */}
            <span className="absolute right-0.5 top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-teal ring-2 ring-white" />
            </span>
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">Pendiente</p>
            <p className="mt-0.5 font-semibold text-navy">Completa tu autorización para empezar</p>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5">
              <ItemPendiente listo={estado.consentimiento_otorgado}>Tu acudiente autoriza tu participación</ItemPendiente>
              <ItemPendiente listo={estado.asentimiento_otorgado}>Tú aceptas participar</ItemPendiente>
            </ul>
          </div>
        </div>
        <Link
          to="/autorizacion"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy"
        >
          Completar ahora
          <IconArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

function PanelEstudiante() {
  const [estado, setEstado] = useState(null);
  const [becas, setBecas] = useState(null);

  useEffect(() => {
    obtenerEstadoAutorizacion().then(setEstado).catch(() => {});
    listarBecas().then(setBecas).catch(() => setBecas([]));
  }, []);

  const autorizado = Boolean(estado?.puede_continuar);

  const pasos = [
    { title: "Autorización", description: "Tu acudiente y tú dan el visto bueno.", hecho: autorizado, to: "/autorizacion" },
    { title: "Cuestionario", description: "Tus puntajes, tu entorno y tus intereses.", hecho: false, to: "/cuestionario", bloqueado: !autorizado },
    { title: "Tu resultado", description: "El área y nivel de formación que encajan contigo.", hecho: false, to: "/resultado", bloqueado: !autorizado },
  ];

  return (
    <div className="min-h-screen bg-ice">
      <Navbar />

      {/* Portada con foto, como en la página de inicio */}
      <section className="relative overflow-hidden bg-navy">
        <img
          src="/img/panel-estudiantes.jpg"
          alt="Estudiantes conversando en un salón de clase"
          className="absolute inset-0 h-full w-full object-cover object-[50%_40%]"
        />
        <div className="absolute inset-0 bg-linear-to-r from-navy/90 via-navy/60 to-navy/10" />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 sm:pb-20 sm:pt-12">
          <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
            ¡Hola! Tu futuro <span className="text-mint">empieza a tomar forma.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">
            Desde aquí sigues tu proceso, ves tu recomendación cuando esté lista
            y exploras carreras y becas en Pereira.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Link
              to="/oferta"
              className="inline-flex items-center gap-2 rounded-full bg-mint px-7 py-3.5 text-base font-medium text-navy shadow-lg shadow-navy/30 transition-colors hover:bg-white"
            >
              Explorar oferta académica
              <IconArrowRight className="h-4 w-4" />
            </Link>
            <a href="#mi-proceso" className="text-base font-medium text-white/90 underline-offset-4 hover:underline">
              Ver mi proceso
            </a>
          </div>
        </div>
      </section>

      {/* Notificación: queda montada sobre el borde de la foto */}
      <div className="relative z-10 mx-auto -mt-12 max-w-5xl px-6">
        <AvisoAutorizacion estado={estado} />
      </div>

      {/* Mi proceso */}
      <section id="mi-proceso" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16">
        <h2 className="text-center text-2xl font-semibold text-navy sm:text-3xl">Tu proceso, paso a paso</h2>
        <div className="relative mt-12 grid gap-8 sm:grid-cols-3">
          <div className="absolute left-0 right-0 top-5 hidden h-px bg-navy/10 sm:block" />
          {pasos.map((paso, index) => (
            <Link
              key={paso.title}
              to={paso.bloqueado ? "/autorizacion" : paso.to}
              className={`group relative text-center ${paso.bloqueado ? "opacity-55" : ""}`}
            >
              <span
                className={`relative z-10 mx-auto flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-semibold shadow-md transition-[color,box-shadow] duration-500 ${
                  paso.hecho
                    ? "bg-mint text-navy shadow-mint/60"
                    : "bg-linear-to-br from-teal to-navy text-white shadow-teal/30 group-hover:text-navy"
                }`}
              >
                {!paso.hecho && (
                  <span className="absolute inset-0 bg-mint opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                )}
                <span className="relative">{paso.hecho ? "✓" : index + 1}</span>
              </span>
              <h3 className="mt-4 font-semibold text-navy">{paso.title}</h3>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-navy/65">{paso.description}</p>
              {paso.bloqueado && (
                <p className="mt-2 text-xs font-medium text-teal">Se desbloquea con tu autorización</p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Oferta académica */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-navy sm:text-3xl">Oferta académica y becas en Pereira</h2>
              <p className="mt-2 max-w-2xl text-navy/70">Conoce desde ya las oportunidades que tienes cerca.</p>
            </div>
            <Link to="/oferta" className="inline-flex items-center gap-1.5 text-sm font-medium text-teal hover:underline">
              Ver toda la oferta
              <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Carreras */}
            <Link
              to="/oferta"
              className="group relative overflow-hidden rounded-2xl bg-linear-to-br from-teal to-navy p-7 text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal/20"
            >
              <span className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-mint/20 blur-2xl" />
              <IconBrain className="h-8 w-8 text-mint" />
              <h3 className="mt-5 text-xl font-bold">Carreras e instituciones</h3>
              <p className="mt-2 text-sm text-white/80">
                Programas técnicos, tecnológicos y universitarios en Pereira, con
                costos, duración y modalidad.
              </p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-mint">
                {autorizado ? "Ver carreras" : "Disponible al completar tu autorización"}
                <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </p>
            </Link>

            {/* Becas */}
            <div className="rounded-2xl border border-navy/5 bg-ice/60 p-7">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-bold text-navy">Becas disponibles</h3>
                {becas && becas.length > 0 && (
                  <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-navy">
                    {becas.length} {becas.length === 1 ? "beca" : "becas"}
                  </span>
                )}
              </div>

              {becas === null ? (
                <p className="mt-4 text-sm text-navy/60">Cargando becas...</p>
              ) : becas.length === 0 ? (
                <p className="mt-4 text-sm text-navy/60">Por ahora no hay becas publicadas.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {becas.slice(0, 3).map((beca) => (
                    <li key={beca.id}>
                      <Link
                        to="/oferta"
                        className="block rounded-xl bg-white p-4 transition-shadow hover:shadow-md hover:shadow-teal/10"
                      >
                        <p className="font-medium text-navy">{beca.nombre}</p>
                        <p className="mt-0.5 text-xs text-navy/60">
                          {beca.entidad}
                          {beca.cobertura ? ` · ${beca.cobertura}` : ""}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-navy/55">
            <IconShield className="h-4 w-4 shrink-0" />
            Lotus.IA es orientativa: no reemplaza a tu orientador escolar ni garantiza cupos o becas.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default function Panel() {
  const { usuario } = useAuth();

  if (usuario?.rol === "ACUDIENTE") {
    return <PanelAcudiente />;
  }
  return <PanelEstudiante />;
}
