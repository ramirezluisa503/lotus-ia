import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Logo from "../components/Logo";
import { IconArrowRight, IconShield } from "../components/icons";
import { useAuth } from "../context/AuthContext";

// Devuelve un número de -1 (la sección apenas entra por abajo de la
// pantalla) a 1 (ya salió por arriba). Las tarjetas lo usan para moverse
// a ritmos distintos mientras se baja. En celular (tarjetas apiladas) o si
// la persona pidió reducir animaciones en su sistema, siempre devuelve 0.
function useProgresoScroll(ref) {
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = null;

    function medir() {
      frame = null;
      const el = ref.current;
      if (!el) return;
      if (window.innerWidth < 640) {
        setProgreso(0);
        return;
      }
      const caja = el.getBoundingClientRect();
      const alto = window.innerHeight;
      const p = ((alto - caja.top) / (alto + caja.height)) * 2 - 1;
      setProgreso(Math.max(-1, Math.min(1, p)));
    }

    function alMover() {
      if (frame === null) frame = requestAnimationFrame(medir);
    }

    medir();
    window.addEventListener("scroll", alMover, { passive: true });
    window.addEventListener("resize", alMover);
    return () => {
      window.removeEventListener("scroll", alMover);
      window.removeEventListener("resize", alMover);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [ref]);

  return progreso;
}

function EncabezadoPortada() {
  const { usuario } = useAuth();
  const destinoPanel = usuario?.rol === "ADMINISTRADOR" ? "/admin" : "/panel";

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Logo variante="claro" />
      <nav className="flex items-center gap-2">
        {usuario ? (
          <Link
            to={destinoPanel}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-medium text-navy shadow-sm transition-colors hover:bg-mint"
          >
            Ir a mi panel
          </Link>
        ) : (
          <>
            <div className="hidden items-center gap-1 rounded-full bg-white/95 p-1.5 shadow-sm sm:flex">
              <a href="#como-funciona" className="rounded-full px-4 py-1.5 text-sm text-navy transition-colors hover:bg-ice">
                Cómo funciona
              </a>
              <Link to="/login" className="rounded-full px-4 py-1.5 text-sm text-navy transition-colors hover:bg-ice">
                Iniciar sesión
              </Link>
            </div>
            <Link
              to="/login"
              className="rounded-full bg-white/95 px-4 py-2.5 text-sm font-medium text-navy shadow-sm sm:hidden"
            >
              Entrar
            </Link>
            <Link
              to="/registro"
              className="rounded-full bg-mint px-5 py-2.5 text-sm font-medium text-navy shadow-sm transition-colors hover:bg-white"
            >
              Registrarme
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

// `desfase`: cuánto y hacia dónde se mueve cada tarjeta al bajar (en px).
const EVALUA = [
  {
    title: "Tu desempeño académico",
    description: "Tus puntajes del ICFES (o de un simulacro) por área muestran en qué te destacas hoy.",
    imagen: "/img/seccion-academico.jpg",
    alt: "Estudiantes trabajando en un salón de clase",
    color: "bg-linear-to-br from-teal to-navy",
    oscura: true,
    desfase: 40,
  },
  {
    title: "Tus intereses",
    description: "Un test breve te muestra hacia dónde se inclinan tus gustos, para que lo compares con tu resultado.",
    imagen: "/img/seccion-intereses.jpg",
    alt: "Señales de un sendero que apuntan en direcciones distintas",
    color: "bg-white",
    desfase: -30,
  },
  {
    title: "Tu contexto real",
    description: "Tu entorno socioeconómico se tiene en cuenta para que la recomendación sea viable para ti.",
    imagen: "/img/seccion-contexto.jpg",
    alt: "Bandera de Colombia ondeando junto a un edificio",
    color: "bg-linear-to-br from-teal to-navy",
    oscura: true,
    desfase: 20,
  },
];

function TarjetaEvalua({ title, description, imagen, alt, color, oscura, desplazamiento }) {
  return (
    <div className="will-change-transform" style={{ transform: `translateY(${desplazamiento}px)` }}>
      <div className="group transition-transform duration-300 hover:-translate-y-2">
        <div
          className={`rounded-2xl p-5 shadow-sm transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-teal/15 ${color}`}
        >
          <div className="overflow-hidden rounded-xl">
            <img
              src={imagen}
              alt={alt}
              loading="lazy"
              className="aspect-4/3 w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <h3 className={`mt-4 font-bold ${oscura ? "text-white" : "text-navy"}`}>{title}</h3>
          <p className={`mt-1.5 text-sm ${oscura ? "text-white/80" : "text-navy/75"}`}>{description}</p>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: "Respondes",
    description:
      "Completas tus datos académicos, un cuestionario sobre tu entorno y un test de aptitudes e intereses.",
  },
  {
    title: "Analizamos",
    description:
      "Un modelo de inteligencia artificial procesa tu perfil de forma anónima para encontrar patrones relevantes.",
  },
  {
    title: "Te orientamos",
    description:
      "Recibes una recomendación personalizada, junto con oferta académica y becas disponibles en Pereira.",
  },
];

export default function Home() {
  const seccionEvaluaRef = useRef(null);
  const progresoEvalua = useProgresoScroll(seccionEvaluaRef);

  return (
    <div className="min-h-screen bg-ice">
      {/* Portada: foto a pantalla completa con el slogan encima */}
      <section className="relative flex min-h-svh flex-col overflow-hidden bg-navy">
        <img
          src="/img/hero-graduacion.jpg"
          alt="Estudiantes lanzando sus birretes al atardecer"
          className="absolute inset-0 h-full w-full object-cover object-[50%_65%]"
        />
        {/* Velo oscuro para que el texto se lea sobre la foto */}
        <div className="absolute inset-0 bg-linear-to-r from-navy/85 via-navy/45 to-navy/10" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-navy/60 to-transparent" />

        <EncabezadoPortada />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 pb-12 pt-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="block">Entiende tu entorno,</span>
              <span className="block text-mint">descubre tus posibilidades.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base text-white/85 sm:text-lg">
              Lotus.IA usa inteligencia artificial para analizar tus resultados
              académicos y tu contexto, y te muestra el área y el nivel de
              formación que mejor encajan contigo, con carreras y becas en
              Pereira.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Link
                to="/registro"
                className="inline-flex items-center gap-2 rounded-full bg-mint px-7 py-3.5 text-base font-medium text-navy shadow-lg shadow-navy/30 transition-colors hover:bg-white"
              >
                Empezar ahora
                <IconArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#como-funciona"
                className="text-base font-medium text-white/90 underline-offset-4 hover:underline"
              >
                ¿Cómo funciona?
              </a>
            </div>

            <p className="mt-6 flex items-center gap-2 text-xs text-white/65">
              <IconShield className="h-4 w-4 shrink-0" />
              Tus datos se usan con consentimiento de tu acudiente y se
              protegen de acuerdo con la Ley 1581 de 2012.
            </p>
          </div>
        </div>
      </section>

      {/* Qué evaluamos */}
      <section ref={seccionEvaluaRef} className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-2xl font-semibold text-navy sm:text-3xl">
          Una recomendación que va más allá de un test
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-navy/70">
          A diferencia de las pruebas vocacionales tradicionales, Lotus.IA
          combina varias dimensiones de tu perfil.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {EVALUA.map((tarjeta) => (
            <TarjetaEvalua
              key={tarjeta.title}
              {...tarjeta}
              desplazamiento={progresoEvalua * tarjeta.desfase}
            />
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-semibold text-navy sm:text-3xl">
            Cómo funciona
          </h2>

          <div className="relative mt-12 grid gap-8 sm:grid-cols-3">
            <div className="absolute left-0 right-0 top-5 hidden h-px bg-navy/10 sm:block" />
            {STEPS.map((step, index) => (
              <div key={step.title} className="relative text-center">
                <span className="relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-teal to-navy text-sm font-semibold text-white shadow-md shadow-teal/30">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold text-navy">{step.title}</h3>
                <p className="mx-auto mt-1.5 max-w-xs text-sm text-navy/65">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      {/* La foto queda quieta (bg-fixed) mientras el contenido pasa por encima */}
      <section
        className="relative bg-cover bg-fixed bg-center"
        style={{ backgroundImage: "url(/img/fondo-lotos.jpg)" }}
      >
        <div className="absolute inset-0 bg-navy/60" />
        <div className="relative mx-auto max-w-3xl px-6 py-28 text-center sm:py-36">
          <h2 className="text-3xl font-bold text-white sm:text-5xl">
            Da el primer paso hacia tu decisión vocacional
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-white/85 sm:text-lg">
            Es gratuito, toma menos de 15 minutos y tu acudiente autoriza el
            proceso desde el primer momento.
          </p>
          <Link
            to="/registro"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-mint px-7 py-3.5 text-base font-medium text-navy shadow-lg shadow-navy/30 transition-colors hover:bg-white"
          >
            Crear mi cuenta
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <p className="mx-auto mt-10 max-w-lg text-xs text-white/65">
            Esta herramienta es orientativa: no reemplaza el acompañamiento del
            orientador escolar ni garantiza cupos o becas.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
