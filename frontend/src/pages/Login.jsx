import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Field, { inputClasses } from "../components/Field";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { mensajeDeError } from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await login({ correo, contrasena });
      navigate("/panel");
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
          Inicia sesión
        </h1>
        <p className="mt-1 text-center text-sm text-navy/60">
          Accede a tu cuenta de Lotus.IA
        </p>

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

          <Field label="Contraseña" id="contrasena">
            <input
              id="contrasena"
              type="password"
              required
              autoComplete="current-password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className={inputClasses(false)}
              placeholder="••••••••"
            />
          </Field>

          <Button type="submit" variant="primary" className="w-full" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy/60">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="font-medium text-teal hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
