import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Field, { inputClasses } from "../components/Field";
import Logo from "../components/Logo";
import { mensajeDeError } from "../services/api";
import { registrar, validarCorreo } from "../services/authService";

const PARENTESCOS = [
  { valor: "MADRE", etiqueta: "Madre" },
  { valor: "PADRE", etiqueta: "Padre" },
  { valor: "TUTOR_LEGAL", etiqueta: "Tutor legal" },
];

export default function Registro() {
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rol: "ESTUDIANTE",
    documento: "",
    grado: "",
    correoEstudiante: "",
    parentesco: "MADRE",
    fechaNacimiento: "",
    aceptaDeclaracionLegal: false,
  });
  const [error, setError] = useState("");
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [verificandoCorreo, setVerificandoCorreo] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const ultimoCorreoVerificado = useRef("");

  function actualizar(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  }

  async function verificarDominioCorreo() {
    const correo = form.correo.trim();
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || correo === ultimoCorreoVerificado.current) {
      return;
    }
    ultimoCorreoVerificado.current = correo;
    setVerificandoCorreo(true);
    try {
      const resultado = await validarCorreo(correo);
      if (!resultado.valido) {
        setErrores((prev) => ({ ...prev, correo: resultado.mensaje }));
      }
    } catch {
      // Si la validación falla por una razón ajena al correo (red, etc.),
      // no bloqueamos el registro: la revisión real ocurre en el backend.
    } finally {
      setVerificandoCorreo(false);
    }
  }

  function calcularEdad(fechaNacimiento) {
    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const cumplioEsteAnio =
      hoy.getMonth() > nacimiento.getMonth() ||
      (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate());
    if (!cumplioEsteAnio) edad -= 1;
    return edad;
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
    if (!form.documento || form.documento.trim().length < 5) {
      err.documento = "Ingresa tu número de documento de identidad.";
    }
    if (form.rol === "ESTUDIANTE" && !form.grado) {
      err.grado = "Selecciona tu grado (10° u 11°).";
    }
    if (form.rol === "ACUDIENTE" && (!form.correoEstudiante || !correoValido(form.correoEstudiante))) {
      err.correoEstudiante = "Indica un correo válido del estudiante.";
    }
    if (form.rol === "ACUDIENTE") {
      if (!form.fechaNacimiento) {
        err.fechaNacimiento = "Indica tu fecha de nacimiento.";
      } else if (calcularEdad(form.fechaNacimiento) < 18) {
        err.fechaNacimiento = "Debes ser mayor de edad para registrarte como acudiente.";
      }
      if (!form.aceptaDeclaracionLegal) {
        err.aceptaDeclaracionLegal = "Debes aceptar la declaración para continuar.";
      }
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
        documento: form.documento,
        grado: form.rol === "ESTUDIANTE" ? Number(form.grado) : undefined,
        correo_estudiante: form.rol === "ACUDIENTE" ? form.correoEstudiante : undefined,
        parentesco: form.rol === "ACUDIENTE" ? form.parentesco : undefined,
        fecha_nacimiento: form.rol === "ACUDIENTE" ? form.fechaNacimiento : undefined,
        acepta_declaracion_legal: form.rol === "ACUDIENTE" ? form.aceptaDeclaracionLegal : undefined,
      });
      // Ya no iniciamos sesión automáticamente: primero debe confirmar su
      // correo con el enlace que le acabamos de enviar.
      setRegistroExitoso(true);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  if (registroExitoso) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ice p-4">
        <div className="w-full max-w-sm rounded-3xl border border-navy/5 bg-white p-8 text-center shadow-xl shadow-teal/10">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h1 className="mt-6 text-lg font-semibold text-navy">Revisa tu correo</h1>
          <p className="mt-3 text-sm text-navy/60">
            Te enviamos un enlace de confirmación a <strong>{form.correo}</strong>. Debes
            abrirlo antes de poder iniciar sesión.
          </p>
          <Link to="/login" className="mt-6 block">
            <Button variant="primary" className="w-full">
              Ir a iniciar sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-ice p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-navy/5 bg-white px-6 py-6 shadow-xl shadow-teal/10 sm:px-10">
        <div className="flex justify-center">
          <Logo />
        </div>

        <h1 className="mt-3 text-center text-lg font-semibold text-navy">
          Crea tu cuenta
        </h1>
        <p className="mt-1 text-center text-sm text-navy/60">
          Empieza tu proceso de orientación vocacional
        </p>

        <form onSubmit={manejarEnvio} className="mt-4 space-y-3">
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

          {/* Campos de dos en dos para que el formulario quepa sin bajar */}
          <div className="grid gap-3 sm:grid-cols-2">
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

          <Field
            label="Correo electrónico"
            id="correo"
            error={errores.correo}
            hint={verificandoCorreo ? "Verificando..." : undefined}
          >
            <input
              id="correo"
              type="email"
              required
              autoComplete="email"
              value={form.correo}
              onChange={(e) => actualizar("correo", e.target.value)}
              onBlur={verificarDominioCorreo}
              className={inputClasses(Boolean(errores.correo))}
              placeholder="tu@correo.com"
            />
          </Field>

          <Field label="Documento de identidad" id="documento" error={errores.documento}>
            <input
              id="documento"
              type="text"
              required
              value={form.documento}
              onChange={(e) => actualizar("documento", e.target.value)}
              className={inputClasses(Boolean(errores.documento))}
              placeholder="Cédula o tarjeta de identidad"
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
                  placeholder="Debe tener su cuenta creada"
                />
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

              <Field label="Fecha de nacimiento" id="fechaNacimiento" error={errores.fechaNacimiento}>
                <input
                  id="fechaNacimiento"
                  type="date"
                  required
                  value={form.fechaNacimiento}
                  onChange={(e) => actualizar("fechaNacimiento", e.target.value)}
                  className={inputClasses(Boolean(errores.fechaNacimiento))}
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
          </div>

          {form.rol === "ACUDIENTE" && (
            <div>
              <label
                className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-xs text-navy/70 ${
                  errores.aceptaDeclaracionLegal ? "border-red-400" : "border-navy/15"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={form.aceptaDeclaracionLegal}
                  onChange={(e) => actualizar("aceptaDeclaracionLegal", e.target.checked)}
                />
                <span>
                  Declaro, bajo las consecuencias legales de la Ley 1581 de 2012, que
                  soy mayor de edad y que tengo la patria potestad o representación
                  legal del estudiante al que voy a autorizar.
                </span>
              </label>
              {errores.aceptaDeclaracionLegal && (
                <p className="mt-1.5 text-xs text-red-600">{errores.aceptaDeclaracionLegal}</p>
              )}
            </div>
          )}

          <Button type="submit" variant="primary" className="w-full" disabled={enviando}>
            {enviando ? "Creando cuenta..." : "Crear mi cuenta"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-navy/60">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-teal hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
