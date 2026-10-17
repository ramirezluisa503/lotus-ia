import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Navbar from "../components/Navbar";
import { IconShield, IconSparkles } from "../components/icons";
import { useAuth } from "../context/AuthContext";

const ROL_ETIQUETA = {
  ESTUDIANTE: "Estudiante",
  ACUDIENTE: "Acudiente",
  ADMINISTRADOR: "Administrador",
};

export default function Panel() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

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

          <p className="mt-6 flex items-center gap-2 text-xs text-navy/50">
            <IconShield className="h-4 w-4 shrink-0" />
            Próximamente: consentimiento del acudiente, cuestionarios y tu
            recomendación vocacional van a aparecer aquí.
          </p>

          <Button variant="secondary" className="mt-6 w-full" onClick={manejarSalir}>
            Cerrar sesión
          </Button>
        </div>
      </main>
    </div>
  );
}
