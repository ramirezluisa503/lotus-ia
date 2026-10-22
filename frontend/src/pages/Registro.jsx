import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Field, { inputClasses } from "../components/Field";
import Logo from "../components/Logo";
import { useAuth } from "../context/AuthContext";
import { mensajeDeError } from "../services/api";
import { registrar } from "../services/authService";

const PARENTESCOS = [
  { valor: "MADRE", etiqueta: "Madre" },
  { valor: "PADRE", etiqueta: "Padre" },
  { valor: "TUTOR_LEGAL", etiqueta: "Tutor legal" },
];

export default function Registro() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rol: "ESTUDIANTE",
    documento: "",
    grado: "",
    correoEstudiante: "",
    parentesco: "MADRE",
  });
  const [error, setError] = useState("");
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  }

  function validar() {
    const err = {};
    const correoValido = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);

    if (!form.nombre || form.nombre.trim().length < 2) {
      err.nombre = "Ingresa tu nombre completo.";
    }
    if (!form.correo || !correoValido(form.correo)) {
      err.correo = "Ingresa un correo válido.";
    }
    if (form.rol === "ESTUDIANTE" && !form.grado) {
      err.grado = "Selecciona tu grado (10° u 11°).";
    }
    if (form.rol === "ACUDIENTE" && (!form.correoEstudiante || !correoValido(form.correoEstudiante))) {
      err.correoEstudiante = "Indica un correo válido del estudiante.";
    }
    if (!form.contrasena || form.contrasena.length < 8) {
      err.contrasena = "Debe tener al menos 8 caracteres.";
    }
    return err;
  }

  async function manejarEnvio(e) {
    e.preventDefault();
    setError("");

    const erroresForm = validar();
    if (Object.keys(erroresForm).length > 0) {
      setErrores(erroresForm);
      setError("Revisa los campos marcados en rojo.");
      return;
    }
    setErrores({});

    setEnviando(true);
    try {
      await registrar({
        nombre: form.nombre,
        correo: form.correo,
        contrasena: form.contrasena,
        rol: form.rol,
        documento: form.rol === "ACUDIENTE" ? form.documento || undefined : undefined,
        grado: form.rol === "ESTUDIANTE" ? Number(form.grado) : undefined,
        correo_estudiante: form.rol === "ACUDIENTE" ? form.correoEstudiante : undefined,
        parentesco: form.rol === "ACUDIENTE" ? form.parentesco : undefined,
      });
      // Registro exitoso: iniciamos sesión automáticamente para no pedirle los
      // datos dos veces.
      await login({ correo: form.correo, contrasena: form.contrasena });
      navigate("/autorizacion");
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

          <Field label="Nombre completo" id="nombre" error={errores.nombre}>
            <input
              id="nombre"
              type="text"
              required
              minLength={2}
              autoComplete="name"
              value={form.nombre}
              onChange={(e) => actualizar("nombre", e.target.value)}
              className={inputClasses(Boolean(errores.nombre))}
              placeholder="Tu nombre y apellido"
            />
          </Field>

          <Field label="Correo electrónico" id="correo" error={errores.correo}>
            <input
              id="correo"
              type="email"
              required
              autoComplete="email"
              value={form.correo}
              onChange={(e) => actualizar("correo", e.target.value)}
              className={inputClasses(Boolean(errores.correo))}
              placeholder="tu@correo.com"
            />
          </Field>

          {form.rol === "ESTUDIANTE" && (
            <Field label="¿En qué grado estás?" id="grado" error={errores.grado}>
              <div
                className={`grid grid-cols-2 gap-2 rounded-lg ${
                  errores.grado ? "ring-2 ring-red-400" : ""
                }`}
              >
                {[10, 11].map((grado) => (
                  <button
                    key={grado}
                    type="button"
                    onClick={() => actualizar("grado", String(grado))}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      form.grado === String(grado)
                        ? "border-teal bg-teal/10 text-teal"
                        : "border-navy/15 text-navy/60 hover:border-navy/30"
                    }`}
                  >
                    {grado}°
                  </button>
                ))}
              </div>
            </Field>
          )}

          {form.rol === "ACUDIENTE" && (
            <>
              <Field
                label="Correo del estudiante"
                id="correoEstudiante"
                error={errores.correoEstudiante}
              >
                <input
                  id="correoEstudiante"
                  type="email"
                  required
                  value={form.correoEstudiante}
                  onChange={(e) => actualizar("correoEstudiante", e.target.value)}
                  className={inputClasses(Boolean(errores.correoEstudiante))}
                  placeholder="correo@del-estudiante.com"
                />
                <p className="mt-1.5 text-xs text-navy/50">
                  El estudiante debe tener su cuenta creada primero.
                </p>
              </Field>

              <Field label="Parentesco" id="parentesco">
                <select
                  id="parentesco"
                  value={form.parentesco}
                  onChange={(e) => actualizar("parentesco", e.target.value)}
                  className={inputClasses(false)}
                >
                  {PARENTESCOS.map((p) => (
                    <option key={p.valor} value={p.valor}>
                      {p.etiqueta}
                    </option>
                  ))}
                </select>
              </Field>

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
            </>
          )}

          <Field label="Contraseña" id="contrasena" error={errores.contrasena}>
            <input
              id="contrasena"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.contrasena}
              onChange={(e) => actualizar("contrasena", e.target.value)}
              className={inputClasses(Boolean(errores.contrasena))}
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
