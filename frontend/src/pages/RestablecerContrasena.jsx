import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Field, { inputClasses } from "../components/Field";
import Logo from "../components/Logo";
import { mensajeDeError } from "../services/api";
import { restablecerContrasena } from "../services/authService";

export default function RestablecerContrasena() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState(false);

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");

    if (nuevaContrasena !== confirmacion) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    try {
      await restablecerContrasena({ token, nueva_contrasena: nuevaContrasena });
      setListo(true);
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
          Crea una nueva contraseña
        </h1>

        {!token ? (
          <div className="mt-6 space-y-4">
            <Alert tipo="error">
              Este enlace no es válido. Solicita uno nuevo desde "¿Olvidaste tu
              contraseña?" en el inicio de sesión.
            </Alert>
            <Link to="/olvide-contrasena">
              <Button variant="secondary" className="w-full">
                Solicitar un nuevo enlace
              </Button>
            </Link>
          </div>
        ) : listo ? (
          <div className="mt-6 space-y-4">
            <Alert tipo="exito">Tu contraseña se actualizó correctamente.</Alert>
            <Button variant="primary" className="w-full" onClick={() => navigate("/login")}>
              Ir a iniciar sesión
            </Button>
          </div>
        ) : (
          <form onSubmit={manejarEnvio} className="mt-6 space-y-4">
            <Alert tipo="error">{error}</Alert>

            <Field label="Nueva contraseña" id="nuevaContrasena">
              <input
                id="nuevaContrasena"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={nuevaContrasena}
                onChange={(e) => setNuevaContrasena(e.target.value)}
                className={inputClasses(false)}
                placeholder="Mínimo 8 caracteres"
              />
            </Field>

            <Field label="Confirma la nueva contraseña" id="confirmacion">
              <input
                id="confirmacion"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                className={inputClasses(false)}
                placeholder="Repite la contraseña"
              />
            </Field>

            <Button type="submit" variant="primary" className="w-full" disabled={enviando}>
              {enviando ? "Guardando..." : "Guardar nueva contraseña"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
