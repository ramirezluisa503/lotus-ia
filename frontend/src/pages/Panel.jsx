import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import {
  IconArrowRight,
  IconBrain,
  IconChart,
  IconHeart,
  IconHome,
  IconShield,
  IconSparkles,
} from "../components/icons";
import { useAuth } from "../context/AuthContext";
import {
  obtenerEstadoAutorizacion,
  obtenerEstadoAutorizacionAcudiente,
} from "../services/consentimientoService";

const ROL_ETIQUETA = {
  ESTUDIANTE: "Estudiante",
  ACUDIENTE: "Acudiente",
  ADMINISTRADOR: "Administrador",
};

const INFO_ACUDIENTE = [
  {
    icon: IconBrain,
    title: "¿Qué es Lotus.IA?",
    description:
      "Un proyecto piloto de orientación vocacional para estudiantes de grado 10° y 11° en Pereira. A partir del desempeño académico, un test de intereses y el contexto del estudiante, una inteligencia artificial sugiere un área de conocimiento y un nivel de formación acordes a su perfil.",
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
  },
];

const PASOS_ACUDIENTE = [
  {
    title: "Autorizas",
    description: "Revisas de qué se trata y das tu consentimiento como acudiente, aquí mismo.",
  },
  {
    title: "Tu estudiante responde",
    description:
      "Con tu autorización activa, completa sus datos académicos, un cuestionario sobre su entorno y un test de intereses.",
  },
  {
    title: "Recibe su resultado",
    description:
      "La IA le recomienda un área de conocimiento y nivel de formación, junto con instituciones y becas en Pereira.",
  },
];

function PanelAcudiente({ usuario }) {
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerEstadoAutorizacionAcudiente()
      .then(setEstado)
      .catch(() => setEstado(null))
      .finally(() => setCargando(false));
  }, []);

  const yaAutorizo = estado?.consentimiento_otorgado;

  return (
    <div className="min-h-screen bg-ice">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-mint/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-cyan-light/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-20 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/50 px-3 py-1 text-xs font-medium text-navy">
              <IconHeart className="h-3.5 w-3.5" />
              Panel del acudiente
            </span>

            <h1 className="mt-5 text-3xl font-semibold leading-tight text-navy sm:text-4xl">
              Gracias por acompañar a tu estudiante en su decisión vocacional
            </h1>

            <p className="mt-5 max-w-xl text-lg text-navy/70">
              Lotus.IA es una herramienta orientativa, no reemplaza el
              acompañamiento del orientador escolar ni garantiza cupos o
              becas. Aquí puedes entender de qué trata antes de autorizar la
              participación del estudiante a tu cargo.
            </p>

            {!cargando && (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button as={Link} to="/autorizacion" variant="primary" size="lg">
                  {yaAutorizo ? "Revisar mi autorización" : "Autorizar participación"}
                  <IconArrowRight className="h-4 w-4" />
                </Button>
                <Button as="a" href="#como-funciona" variant="ghost" size="lg">
                  ¿Cómo funciona?
                </Button>
              </div>
            )}
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-teal/10 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-navy/50">
                  Tu cuenta
                </span>
                <IconSparkles className="h-4 w-4 text-teal" />
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-navy/60">Correo</dt>
                  <dd className="font-medium text-navy">{usuario?.correo}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-navy/60">Rol</dt>
                  <dd className="font-medium text-navy">
                    {ROL_ETIQUETA[usuario?.rol] ?? usuario?.rol}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-navy/10 pt-4">
                <p className="text-sm font-medium text-navy">Estado de autorización</p>
                <p className="mt-1.5 flex items-center gap-2 text-sm text-navy/70">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      yaAutorizo ? "bg-mint/60 text-navy" : "bg-navy/10 text-navy/40"
                    }`}
                  >
                    {yaAutorizo ? "✓" : "–"}
                  </span>
                  {cargando ? "Consultando..." : yaAutorizo ? "Ya autorizaste" : "Pendiente"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qué necesitas saber */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold text-navy sm:text-3xl">
          Lo que necesitas saber antes de autorizar
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-navy/70">
          Tu rol es breve pero importante: tu autorización es lo único que
          falta para que el estudiante pueda empezar.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {INFO_ACUDIENTE.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-2xl border border-navy/5 bg-white p-6 transition-shadow hover:shadow-lg hover:shadow-teal/10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal/10 text-teal">
                <Icon className="h-5.5 w-5.5" />
              </span>
              <h3 className="mt-4 font-semibold text-navy">{title}</h3>
              <p className="mt-1.5 text-sm text-navy/65">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-semibold text-navy sm:text-3xl">
            Cómo funciona desde que autorizas
          </h2>

          <div className="relative mt-12 grid gap-8 sm:grid-cols-3">
            <div className="absolute left-0 right-0 top-5 hidden h-px bg-navy/10 sm:block" />
            {PASOS_ACUDIENTE.map((paso, index) => (
              <div key={paso.title} className="relative text-center">
                <span className="relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-teal to-navy text-sm font-semibold text-white shadow-md shadow-teal/30">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold text-navy">{paso.title}</h3>
                <p className="mx-auto mt-1.5 max-w-xs text-sm text-navy/65">
                  {paso.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal to-navy px-8 py-12 text-center sm:px-16">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-mint/20 blur-2xl" />
          {yaAutorizo ? (
            <>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Ya autorizaste la participación de tu estudiante
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/80">
                Puede continuar con su cuestionario y recibir su recomendación.
                Si cambias de opinión, puedes revisar tu decisión cuando
                quieras.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                ¿Listo/a para autorizar?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/80">
                Toma menos de un minuto. Mientras no lo hagas, el estudiante a
                tu cargo no puede avanzar con su proceso.
              </p>
            </>
          )}
          <Button as={Link} to="/autorizacion" variant="light" size="lg" className="mt-7">
            {yaAutorizo ? "Revisar mi autorización" : "Ir a autorizar"}
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="mx-auto mt-8 max-w-2xl rounded-xl border border-cyan-light bg-white px-5 py-3.5 text-center text-sm text-navy/70 flex items-center gap-2 justify-center">
          <IconChart className="h-4 w-4 shrink-0 text-teal" />
          <span>
            ¿Dudas? Puedes volver a esta página cuando quieras desde el logo
            de Lotus.IA, arriba a la izquierda.
          </span>
        </p>

      </section>

      <Footer />
    </div>
  );
}

export default function Panel() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [estado, setEstado] = useState(null);

  useEffect(() => {
    if (usuario?.rol === "ESTUDIANTE") {
      obtenerEstadoAutorizacion().then(setEstado).catch(() => {});
    }
  }, [usuario]);

  function manejarSalir() {
    logout();
    navigate("/");
  }

  if (usuario?.rol === "ACUDIENTE") {
    return <PanelAcudiente usuario={usuario} />;
  }

  return (
    <div className="min-h-screen bg-ice">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-3xl border border-navy/5 bg-white p-8 shadow-xl shadow-teal/10">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/40 text-teal">
            <IconSparkles className="h-5.5 w-5.5" />
          </span>

          <h1 className="mt-4 text-xl font-semibold text-navy">
            ¡Hola! Tu sesión está activa
          </h1>
          <p className="mt-1 text-sm text-navy/60">
            Esto confirma que el inicio de sesión y los permisos por rol ya
            funcionan de punta a punta.
          </p>

          <dl className="mt-6 space-y-3 rounded-xl bg-ice/60 p-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-navy/60">Correo</dt>
              <dd className="font-medium text-navy">{usuario?.correo}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-navy/60">Rol</dt>
              <dd className="font-medium text-navy">
                {ROL_ETIQUETA[usuario?.rol] ?? usuario?.rol}
              </dd>
            </div>
          </dl>

          {usuario?.rol === "ESTUDIANTE" && (
            <div className="mt-4 rounded-xl border border-navy/10 p-4">
              <p className="text-sm font-medium text-navy">
                {estado?.puede_continuar
                  ? "✓ Autorización completa"
                  : "Falta completar tu autorización"}
              </p>
              <p className="mt-1 text-xs text-navy/60">
                {estado?.puede_continuar
                  ? "Ya puedes continuar con tu cuestionario."
                  : "Necesitas la autorización de tu acudiente y tu propia aceptación."}
              </p>
              <Link
                to={estado?.puede_continuar ? "/cuestionario" : "/autorizacion"}
                className="mt-3 inline-block text-sm font-medium text-teal hover:underline"
              >
                {estado?.puede_continuar ? "Ir a mi cuestionario →" : "Ir a mi autorización →"}
              </Link>
            </div>
          )}

          {usuario?.rol === "ESTUDIANTE" && estado?.puede_continuar && (
            <div className="mt-4 rounded-xl border border-navy/10 p-4">
              <p className="text-sm font-medium text-navy">Tu recomendación vocacional</p>
              <Link to="/resultado" className="mt-3 inline-block text-sm font-medium text-teal hover:underline">
                Ver mi resultado →
              </Link>
            </div>
          )}

          {usuario?.rol === "ESTUDIANTE" && (
            <div className="mt-4 rounded-xl border border-navy/10 p-4">
              <p className="text-sm font-medium text-navy">
                Oferta académica y becas en Pereira
              </p>
              <p className="mt-1 text-xs text-navy/60">
                Explora instituciones, carreras y apoyos económicos mientras
                esperas tu recomendación.
              </p>
              <Link to="/oferta" className="mt-3 inline-block text-sm font-medium text-teal hover:underline">
                Explorar oferta →
              </Link>
            </div>
          )}

          {usuario?.rol === "ESTUDIANTE" && !estado?.puede_continuar && (
            <p className="mt-6 flex items-center gap-2 text-xs text-navy/50">
              <IconShield className="h-4 w-4 shrink-0" />
              Próximamente: tu recomendación vocacional va a aparecer aquí.
            </p>
          )}

          <Button variant="secondary" className="mt-6 w-full" onClick={manejarSalir}>
            Cerrar sesión
          </Button>
        </div>
      </main>
    </div>
  );
}
