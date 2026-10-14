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

const EVALUA = [
  {
    icon: IconChart,
    title: "Tu desempeño académico",
    description: "Tus resultados por área te muestran en qué te destacas hoy.",
  },
  {
    icon: IconBrain,
    title: "Tus aptitudes e intereses",
    description: "Un test breve identifica hacia dónde se inclinan tus fortalezas.",
  },
  {
    icon: IconHome,
    title: "Tu contexto real",
    description: "Consideramos tu entorno socioeconómico para una recomendación viable.",
  },
];

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
  return (
    <div className="min-h-screen bg-ice">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-mint/40 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-cyan-light/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/50 px-3 py-1 text-xs font-medium text-navy">
              <IconSparkles className="h-3.5 w-3.5" />
              Proyecto piloto en Pereira
            </span>

            <h1 className="mt-5 text-4xl font-semibold leading-tight text-navy sm:text-5xl">
              Encuentra tu camino profesional con ayuda de la{" "}
              <span className="text-teal">inteligencia artificial</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg text-navy/70">
              Lotus.IA analiza tu perfil académico, tus aptitudes y tu contexto
              para recomendarte el área de conocimiento y nivel de formación
              que mejor encajan contigo.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button as="a" href="/registro" variant="primary" size="lg">
                Empezar ahora
                <IconArrowRight className="h-4 w-4" />
              </Button>
              <Button as="a" href="#como-funciona" variant="ghost" size="lg">
                ¿Cómo funciona?
              </Button>
            </div>

            <p className="mt-6 flex items-center gap-2 text-xs text-navy/50">
              <IconShield className="h-4 w-4 shrink-0" />
              Tus datos se usan con consentimiento de tu acudiente y se
              protegen de acuerdo con la Ley 1581 de 2012.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-teal/10 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-navy/50">
                  Tu resultado
                </span>
                <IconSparkles className="h-4 w-4 text-teal" />
              </div>
              <p className="mt-4 text-sm text-navy/60">Área recomendada</p>
              <p className="text-xl font-semibold text-navy">
                Ingeniería, arquitectura y afines
              </p>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-ice">
                <div className="h-full w-[82%] rounded-full bg-linear-to-r from-teal to-mint" />
              </div>
              <p className="mt-1 text-xs text-navy/50">Afinidad: alta</p>

              <div className="mt-5 space-y-2 border-t border-navy/10 pt-4">
                <div className="flex items-center gap-2 text-sm text-navy/70">
                  <IconHome className="h-4 w-4 text-teal" />
                  3 instituciones en Pereira
                </div>
                <div className="flex items-center gap-2 text-sm text-navy/70">
                  <IconHeart className="h-4 w-4 text-teal" />
                  2 becas disponibles
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Qué evaluamos */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-2xl font-semibold text-navy sm:text-3xl">
          Una recomendación que va más allá de un test
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-navy/70">
          A diferencia de las pruebas vocacionales tradicionales, Lotus.IA
          combina varias dimensiones de tu perfil.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {EVALUA.map(({ icon: Icon, title, description }) => (
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
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal to-navy px-8 py-12 text-center sm:px-16">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-mint/20 blur-2xl" />
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Da el primer paso hacia tu decisión vocacional
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">
            Es gratuito, toma menos de 15 minutos y tu acudiente autoriza el
            proceso desde el primer momento.
          </p>
          <Button
            as="a"
            href="/registro"
            variant="light"
            size="lg"
            className="mt-7"
          >
            Crear mi cuenta
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <p className="mx-auto mt-8 max-w-2xl rounded-xl border border-cyan-light bg-white px-5 py-3.5 text-center text-sm text-navy/70">
          Esta herramienta es orientativa: no reemplaza el acompañamiento del
          orientador escolar ni garantiza cupos o becas.
        </p>
      </section>

      <Footer />
    </div>
  );
}
