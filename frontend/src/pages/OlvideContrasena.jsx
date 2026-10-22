import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Field, { inputClasses } from "../components/Field";
import Logo from "../components/Logo";
import { mensajeDeError } from "../services/api";
import { olvideContrasena } from "../services/authService";

export default function OlvideContrasena() {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await olvideContrasena({ correo });
      setEnviado(true);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ice px-6">
      <div className="w-full max-w-sm rounded-3xl border border-navy/5 bg-white p-8 shadow-xl shadow-teal/10">
        <div className="flex justify-center">
          <Logo />
        </div>

        <h1 className="mt-6 text-center text-lg font-semibold text-navy">
          Recupera tu contraseña
        </h1>
        <p className="mt-1 text-center text-sm text-navy/60">
          Te enviaremos un enlace a tu correo para crear una nueva
        </p>

        {enviado ? (
          <div className="mt-6 space-y-4">
            <Alert tipo="exito">
              Si ese correo está registrado, te enviamos un enlace para restablecer tu
              contraseña. Revisa tu bandeja de entrada (y la carpeta de spam).
            </Alert>
            <Link to="/login">
              <Button variant="secondary" className="w-full">
                Volver a iniciar sesión
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={manejarEnvio} className="mt-6 space-y-4">
            <Alert tipo="error">{error}</Alert>

            <Field label="Correo electrónico" id="correo">
              <input
                id="correo"
                type="email"
                required
                autoComplete="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className={inputClasses(false)}
                placeholder="tu@correo.com"
              />
            </Field>

            <Button type="submit" variant="primary" className="w-full" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-navy/60">
          <Link to="/login" className="font-medium text-teal hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
