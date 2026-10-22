import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import { IconBrain, IconHome, IconShield, IconSparkles } from "../components/icons";
import { useAuth } from "../context/AuthContext";
import { obtenerEstadoAutorizacion } from "../services/consentimientoService";

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
      "Un proyecto piloto de orientación vocacional para estudiantes de grado 10° y 11° en Pereira. A partir del desempeño académico, un test de intereses y el contexto del estudiante, una inteligencia artificial le sugiere un área de conocimiento y un nivel de formación.",
  },
  {
    icon: IconShield,
    title: "¿Por qué se necesita tu autorización?",
    description:
      "Como el estudiante a tu cargo es menor de edad, la ley (1581 de 2012) exige tu consentimiento antes de usar su información. Sin tu autorización, el proceso queda bloqueado y el estudiante no puede avanzar.",
  },
  {
    icon: IconHome,
    title: "¿Cómo se protegen sus datos?",
    description:
      "El nombre y documento del estudiante se cifran y se guardan separados de sus respuestas: la IA nunca ve su identidad, solo un código anónimo. Puedes cambiar tu decisión y revocar la autorización cuando quieras.",
  },
];

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

  return (
    <div className="min-h-screen bg-ice">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-3xl border border-navy/5 bg-white p-8 shadow-xl shadow-teal/10">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/40 text-teal">
            <IconSparkles className="h-5.5 w-5.5" />
          </span>

          <h1 className="mt-4 text-xl font-semibold text-navy">
            {usuario?.rol === "ACUDIENTE" ? "¡Bienvenido/a a Lotus.IA!" : "¡Hola! Tu sesión está activa"}
          </h1>
          <p className="mt-1 text-sm text-navy/60">
            {usuario?.rol === "ACUDIENTE"
              ? "Aquí puedes revisar de qué trata la plataforma y gestionar tu autorización."
              : "Esto confirma que el inicio de sesión y los permisos por rol ya funcionan de punta a punta."}
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

          {usuario?.rol === "ACUDIENTE" && (
            <>
              <div className="mt-6 space-y-3">
                {INFO_ACUDIENTE.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="flex gap-3 rounded-xl border border-navy/10 p-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/10 text-teal">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-navy">{title}</p>
                      <p className="mt-0.5 text-xs text-navy/60">{description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-navy/10 p-4">
                <p className="text-sm font-medium text-navy">
                  Autorización del estudiante a tu cargo
                </p>
                <Link
                  to="/autorizacion"
                  className="mt-3 inline-block text-sm font-medium text-teal hover:underline"
                >
                  Ir a autorizar →
                </Link>
              </div>
            </>
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
