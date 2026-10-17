import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Field, { inputClasses } from "../components/Field";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { mensajeDeError } from "../services/api";
import { registrar } from "../services/authService";

export default function Registro() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rol: "ESTUDIANTE",
    documento: "",
  });
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await registrar({
        nombre: form.nombre,
        correo: form.correo,
        contrasena: form.contrasena,
        rol: form.rol,
        documento: form.rol === "ACUDIENTE" ? form.documento || undefined : undefined,
      });
      // Registro exitoso: iniciamos sesión automáticamente para no pedirle los
      // datos dos veces.
      await login({ correo: form.correo, contrasena: form.contrasena });
      navigate("/panel");
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ice px-6 py-10">
      <div className="w-full max-w-sm rounded-3xl border border-navy/5 bg-white p-8 shadow-xl shadow-teal/10">
        <div className="flex justify-center">
          <Logo />
        </div>

        <h1 className="mt-6 text-center text-lg font-semibold text-navy">
          Crea tu cuenta
        </h1>
        <p className="mt-1 text-center text-sm text-navy/60">
          Empieza tu proceso de orientación vocacional
        </p>

        <form onSubmit={manejarEnvio} className="mt-6 space-y-4">
          <Alert tipo="error">{error}</Alert>

          <Field label="¿Quién eres?" id="rol">
            <div className="grid grid-cols-2 gap-2">
              {[
                { valor: "ESTUDIANTE", etiqueta: "Estudiante" },
                { valor: "ACUDIENTE", etiqueta: "Acudiente" },
              ].map((opcion) => (
                <button
                  key={opcion.valor}
                  type="button"
                  onClick={() => actualizar("rol", opcion.valor)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    form.rol === opcion.valor
                      ? "border-teal bg-teal/10 text-teal"
                      : "border-navy/15 text-navy/60 hover:border-navy/30"
                  }`}
                >
                  {opcion.etiqueta}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Nombre completo" id="nombre">
            <input
              id="nombre"
              type="text"
              required
              minLength={2}
              autoComplete="name"
              value={form.nombre}
              onChange={(e) => actualizar("nombre", e.target.value)}
              className={inputClasses(false)}
              placeholder="Tu nombre y apellido"
            />
          </Field>

          <Field label="Correo electrónico" id="correo">
            <input
              id="correo"
              type="email"
              required
              autoComplete="email"
              value={form.correo}
              onChange={(e) => actualizar("correo", e.target.value)}
              className={inputClasses(false)}
              placeholder="tu@correo.com"
            />
          </Field>

          {form.rol === "ACUDIENTE" && (
            <Field label="Documento de identidad (opcional)" id="documento">
              <input
                id="documento"
                type="text"
                value={form.documento}
                onChange={(e) => actualizar("documento", e.target.value)}
                className={inputClasses(false)}
                placeholder="Cédula de ciudadanía"
              />
            </Field>
          )}

          <Field label="Contraseña" id="contrasena">
            <input
              id="contrasena"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.contrasena}
              onChange={(e) => actualizar("contrasena", e.target.value)}
              className={inputClasses(false)}
              placeholder="Mínimo 8 caracteres"
            />
          </Field>

          <Button type="submit" variant="primary" className="w-full" disabled={enviando}>
            {enviando ? "Creando cuenta..." : "Crear mi cuenta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-navy/60">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-teal hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
