import Button from "../components/Button";
import Logo from "../components/Logo";

const STEPS = [
  {
    title: "Respondes",
    description:
      "Completas tus datos académicos, un breve cuestionario sobre tu entorno y un test de aptitudes e intereses.",
  },
  {
    title: "Analizamos",
    description:
      "Un modelo de inteligencia artificial procesa tu perfil de forma anónima para encontrar patrones relevantes.",
  },
  {
    title: "Te orientamos",
    description:
      "Recibes una recomendación personalizada de área de conocimiento, junto con oferta académica y becas en Pereira.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-ice">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="flex items-center gap-3">
          <Button as="a" href="/login" variant="secondary">
            Iniciar sesión
          </Button>
          <Button as="a" href="/registro" variant="primary">
            Registrarme
          </Button>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-20 pt-10 text-center">
        <h1 className="text-3xl font-semibold text-navy sm:text-4xl">
          Orientación vocacional con inteligencia artificial
        </h1>
        <p className="mt-4 text-base text-navy/70 sm:text-lg">
          Lotus.IA te ayuda a descubrir qué área de conocimiento y nivel de
          formación encajan mejor contigo, considerando tu desempeño
          académico, tus intereses y tu contexto real.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Button as="a" href="/registro" variant="primary">
            Empezar ahora
          </Button>
        </div>

        <section className="mt-16 grid gap-6 text-left sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-teal/15 bg-white p-5 shadow-sm"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mint text-sm font-semibold text-navy">
                {index + 1}
              </span>
              <h2 className="mt-3 font-semibold text-navy">{step.title}</h2>
              <p className="mt-1 text-sm text-navy/70">{step.description}</p>
            </div>
          ))}
        </section>

        <p className="mt-12 rounded-lg border border-cyan-light bg-cyan-light/40 px-4 py-3 text-sm text-navy/80">
          Esta herramienta es orientativa: no reemplaza el acompañamiento del
          orientador escolar ni garantiza cupos o becas.
        </p>
      </main>
    </div>
  );
}
