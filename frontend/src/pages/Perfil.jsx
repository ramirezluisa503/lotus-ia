import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Field, { inputClasses } from "../components/Field";
import Navbar from "../components/Navbar";
import { IconHeart, IconShield, IconSparkles } from "../components/icons";
import { useAuth } from "../context/AuthContext";
import { mensajeDeError } from "../services/api";
import { actualizarPerfil, cambiarContrasena, vincularEstudiante } from "../services/authService";
import {
  obtenerEstadoAutorizacion,
  obtenerEstudiantesACargo,
  obtenerMiAcudiente,
} from "../services/consentimientoService";
import {
  obtenerMiEstado,
  obtenerMisRespuestas,
  obtenerPerfilPsicometrico,
} from "../services/cuestionarioService";
import {
  marcarNotificacionLeida,
  marcarTodasLeidas,
  obtenerNotificaciones,
} from "../services/notificacionService";
import { eliminarRecomendacion, obtenerHistorialRecomendaciones } from "../services/recomendacionService";

const ROL_ETIQUETA = { ESTUDIANTE: "Estudiante", ACUDIENTE: "Acudiente", ADMINISTRADOR: "Administrador" };
const PARENTESCOS = [
  { valor: "MADRE", etiqueta: "Madre" },
  { valor: "PADRE", etiqueta: "Padre" },
  { valor: "TUTOR_LEGAL", etiqueta: "Tutor legal" },
];

const ESTADO_ETIQUETA = {
  REGISTRADO: "Registrado",
  AUTORIZADO: "Autorizado, falta el cuestionario",
  DATOS_COMPLETOS: "Cuestionario completo, falta la recomendación",
  RECOMENDADO: "Recomendación lista",
};

const NIVEL_ETIQUETA = {
  TECNICO_PROFESIONAL: "Técnico profesional",
  TECNOLOGICO: "Tecnológico",
  UNIVERSITARIO: "Universitario",
};

const DIMENSION_ETIQUETA = {
  REALISTA: "Realista",
  INVESTIGADOR: "Investigador",
  ARTISTICO: "Artístico",
  SOCIAL: "Social",
  EMPRENDEDOR: "Emprendedor",
  CONVENCIONAL: "Convencional",
};

function tiempoRelativo(fechaIso) {
  const segundos = Math.max(0, (Date.now() - new Date(fechaIso).getTime()) / 1000);
  if (segundos < 60) return "justo ahora";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} d`;
}

function Seccion({ titulo, subtitulo, children }) {
  return (
    <div className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-navy/50">{titulo}</h2>
      {subtitulo && <p className="mt-1 text-xs text-navy/50">{subtitulo}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function TarjetaEstudianteVinculado({ estudiante }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-navy/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-navy">{estudiante.nombre}</p>
        <p className="text-xs text-navy/50">
          {estudiante.correo} · Documento: {estudiante.documento || "sin registrar"} ·{" "}
          {PARENTESCOS.find((p) => p.valor === estudiante.parentesco)?.etiqueta ?? estudiante.parentesco}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
            estudiante.consentimiento_otorgado ? "bg-mint/50 text-navy" : "bg-navy/5 text-navy/50"
          }`}
        >
          {estudiante.consentimiento_otorgado ? "✓ Autorizado" : "Pendiente"}
        </span>
        {!estudiante.consentimiento_otorgado && (
          <Link to="/autorizacion" className="text-xs font-medium text-teal hover:underline">
            Ir a autorizar →
          </Link>
        )}
      </div>
    </div>
  );
}

function PerfilAcudiente({ usuario }) {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [correoEstudiante, setCorreoEstudiante] = useState("");
  const [parentesco, setParentesco] = useState("MADRE");
  const [enviando, setEnviando] = useState(false);
  const [mensajeVinculo, setMensajeVinculo] = useState("");
  const [errorVinculo, setErrorVinculo] = useState("");

  function cargar() {
    setCargando(true);
    obtenerEstudiantesACargo()
      .then(setEstudiantes)
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }

  useEffect(cargar, []);

  async function manejarVincular(e) {
    e.preventDefault();
    setErrorVinculo("");
    setMensajeVinculo("");

    if (!correoEstudiante || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoEstudiante)) {
      setErrorVinculo("Ingresa un correo válido del estudiante.");
      return;
    }

    setEnviando(true);
    try {
      await vincularEstudiante({ correo_estudiante: correoEstudiante, parentesco });
      setMensajeVinculo("Estudiante vinculado correctamente. Ya puedes autorizarlo.");
      setCorreoEstudiante("");
      cargar();
    } catch (err) {
      setErrorVinculo(mensajeDeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-navy/5 bg-white p-8 shadow-xl shadow-teal/10">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/40 text-teal">
          <IconHeart className="h-5.5 w-5.5" />
        </span>

        <h1 className="mt-4 text-xl font-semibold text-navy">Mi perfil</h1>

        <dl className="mt-4 space-y-2 rounded-xl bg-ice/60 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-navy/60">Correo</dt>
            <dd className="font-medium text-navy">{usuario?.correo}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-navy/60">Rol</dt>
            <dd className="font-medium text-navy">{ROL_ETIQUETA[usuario?.rol] ?? usuario?.rol}</dd>
          </div>
        </dl>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-navy/50">
          Estudiantes a tu cargo {!cargando && `(${estudiantes.length})`}
        </h2>

        <div className="mt-3 space-y-3">
          <Alert tipo="error">{error}</Alert>
          {cargando ? (
            <p className="text-sm text-navy/60">Cargando...</p>
          ) : estudiantes.length === 0 ? (
            <p className="text-sm text-navy/60">Todavía no tienes ningún estudiante vinculado.</p>
          ) : (
            estudiantes.map((est) => (
              <TarjetaEstudianteVinculado key={est.estudiante_usuario_id} estudiante={est} />
            ))
          )}
        </div>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-navy/50">
          Vincular otro estudiante
        </h2>
        <p className="mt-1 text-xs text-navy/50">
          Si tienes más de un estudiante a tu cargo (por ejemplo, otro hijo o hija), agrégalo
          aquí con su correo — no necesitas crear otra cuenta.
        </p>

        <form onSubmit={manejarVincular} className="mt-3 space-y-3">
          <Alert tipo="error">{errorVinculo}</Alert>
          {mensajeVinculo && <Alert tipo="exito">{mensajeVinculo}</Alert>}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Field label="Correo del estudiante" id="correoEstudianteNuevo">
              <input
                id="correoEstudianteNuevo"
                type="email"
                value={correoEstudiante}
                onChange={(e) => setCorreoEstudiante(e.target.value)}
                className={inputClasses(false)}
                placeholder="Debe tener su cuenta creada"
              />
            </Field>
            <Field label="Parentesco" id="parentescoNuevo">
              <select
                id="parentescoNuevo"
                value={parentesco}
                onChange={(e) => setParentesco(e.target.value)}
                className={inputClasses(false)}
              >
                {PARENTESCOS.map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.etiqueta}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Button type="submit" variant="primary" disabled={enviando}>
            {enviando ? "Vinculando..." : "Vincular estudiante"}
          </Button>
        </form>

        <Link to="/panel" className="mt-8 block text-center text-sm font-medium text-teal hover:underline">
          Volver a mi panel
        </Link>
      </div>
    </main>
  );
}

function SeccionResumen() {
  const [estado, setEstado] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerMiEstado()
      .then(setEstado)
      .catch((err) => setError(mensajeDeError(err)));
  }, []);

  return (
    <Seccion titulo="Resumen de tu proceso">
      <Alert tipo="error">{error}</Alert>
      {estado && (
        <div className="rounded-xl border border-navy/10 p-4">
          <p className="text-sm font-medium text-navy">
            {ESTADO_ETIQUETA[estado.estado_proceso] ?? estado.estado_proceso}
          </p>
          <p className="mt-1 text-xs text-navy/50">Grado {estado.grado}°</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <Link to="/autorizacion" className="font-medium text-teal hover:underline">
              Ver mi autorización →
            </Link>
            {estado.estado_proceso === "DATOS_COMPLETOS" && (
              <Link to="/cuestionario" className="font-medium text-teal hover:underline">
                Continuar mi cuestionario →
              </Link>
            )}
            {estado.estado_proceso === "RECOMENDADO" && (
              <Link to="/resultado" className="font-medium text-teal hover:underline">
                Ver mi resultado →
              </Link>
            )}
          </div>
        </div>
      )}
    </Seccion>
  );
}

function SeccionRecomendaciones() {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [borrandoId, setBorrandoId] = useState(null);

  useEffect(() => {
    obtenerHistorialRecomendaciones()
      .then(setRecomendaciones)
      .catch((err) => {
        if (err.response?.status !== 403) setError(mensajeDeError(err));
      })
      .finally(() => setCargando(false));
  }, []);

  async function borrar(id) {
    if (!window.confirm("¿Seguro que quieres borrar esta recomendación? No se puede deshacer.")) {
      return;
    }
    setError("");
    setBorrandoId(id);
    try {
      await eliminarRecomendacion(id);
      setRecomendaciones((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setBorrandoId(null);
    }
  }

  return (
    <Seccion titulo="Tus recomendaciones">
      <Alert tipo="error">{error}</Alert>
      {cargando ? (
        <p className="text-sm text-navy/60">Cargando...</p>
      ) : recomendaciones.length === 0 ? (
        <p className="text-sm text-navy/60">Todavía no tienes ninguna recomendación generada.</p>
      ) : (
        <div className="space-y-2">
          {recomendaciones.map((r) => (
            <div key={r.id} className="rounded-xl border border-navy/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-navy">{r.area}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-navy/40">{tiempoRelativo(r.generada_en)}</span>
                  <button
                    type="button"
                    onClick={() => borrar(r.id)}
                    disabled={borrandoId === r.id}
                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    {borrandoId === r.id ? "Borrando..." : "Borrar"}
                  </button>
                </div>
              </div>
              <p className="text-xs text-navy/60">
                Nivel: {NIVEL_ETIQUETA[r.nivel_formacion] ?? r.nivel_formacion}
                {r.probabilidad !== null && ` · Afinidad: ${Math.round(r.probabilidad * 100)}%`}
              </p>
            </div>
          ))}
        </div>
      )}
      <Link to="/resultado" className="mt-3 inline-block text-xs font-medium text-teal hover:underline">
        Ver mi resultado más reciente →
      </Link>
    </Seccion>
  );
}

function SeccionAcudiente() {
  const [acudientes, setAcudientes] = useState([]);
  const [estado, setEstado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([obtenerMiAcudiente(), obtenerEstadoAutorizacion()])
      .then(([listaAcudientes, estadoAutorizacion]) => {
        setAcudientes(listaAcudientes);
        setEstado(estadoAutorizacion);
      })
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }, []);

  return (
    <Seccion titulo="Quién es tu acudiente">
      <Alert tipo="error">{error}</Alert>
      {cargando ? (
        <p className="text-sm text-navy/60">Cargando...</p>
      ) : acudientes.length === 0 ? (
        <p className="text-sm text-navy/60">
          Todavía no tienes ningún acudiente registrado. Pídele que cree su cuenta y te
          vincule.
        </p>
      ) : (
        <div className="space-y-2">
          {acudientes.map((a) => (
            <div key={a.correo} className="flex items-center justify-between rounded-xl border border-navy/10 p-4">
              <div>
                <p className="text-sm font-semibold text-navy">{a.nombre}</p>
                <p className="text-xs text-navy/50">
                  {a.correo} ·{" "}
                  {PARENTESCOS.find((p) => p.valor === a.parentesco)?.etiqueta ?? a.parentesco}
                </p>
              </div>
              {estado && (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    estado.consentimiento_otorgado ? "bg-mint/50 text-navy" : "bg-navy/5 text-navy/50"
                  }`}
                >
                  {estado.consentimiento_otorgado ? "✓ Autorizó" : "Pendiente"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Seccion>
  );
}

function FilaDato({ etiqueta, valor }) {
  if (valor === null || valor === undefined || valor === "") return null;
  return (
    <div className="flex justify-between gap-4 border-b border-navy/5 py-1.5 last:border-0">
      <dt className="text-navy/50">{etiqueta}</dt>
      <dd className="text-right font-medium text-navy">{String(valor)}</dd>
    </div>
  );
}

function SeccionRespuestas() {
  const [datos, setDatos] = useState(null);
  const [riasec, setRiasec] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([obtenerMisRespuestas(), obtenerPerfilPsicometrico().catch(() => ({ dimensiones: [] }))])
      .then(([respuestas, perfilPsicometrico]) => {
        setDatos(respuestas);
        setRiasec(perfilPsicometrico.dimensiones);
      })
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Seccion titulo="Historial de respuestas"><p className="text-sm text-navy/60">Cargando...</p></Seccion>;

  return (
    <Seccion titulo="Historial de respuestas" subtitulo="Lo que ya respondiste en tu cuestionario.">
      <Alert tipo="error">{error}</Alert>
      {datos && (
        <div className="space-y-4">
          <div className="rounded-xl border border-navy/10 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/40">Académico</p>
            <dl className="text-sm">
              {datos.notas.map((n) => (
                <FilaDato key={n.area} etiqueta={n.area} valor={`${n.nota}/100`} />
              ))}
              <FilaDato etiqueta="Puntaje global ICFES" valor={datos.puntaje_global_icfes} />
              <FilaDato etiqueta="Nivel de inglés" valor={datos.desempeno_ingles} />
              {datos.es_simulacro && (
                <p className="mt-1.5 text-xs text-navy/50">
                  Estos puntajes son de un simulacro/pre-ICFES, no del resultado oficial.
                </p>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-navy/10 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/40">
              Sociodemográfico
            </p>
            <dl className="text-sm">
              <FilaDato etiqueta="Edad" valor={datos.edad} />
              <FilaDato etiqueta="Género" valor={datos.genero} />
              <FilaDato etiqueta="Zona" valor={datos.zona} />
              <FilaDato etiqueta="Tipo de institución" valor={datos.tipo_institucion} />
              <FilaDato etiqueta="Carácter del colegio" valor={datos.cole_caracter} />
              <FilaDato etiqueta="Jornada" valor={datos.cole_jornada} />
            </dl>
          </div>

          <div className="rounded-xl border border-navy/10 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/40">
              Socioeconómico
            </p>
            <dl className="text-sm">
              <FilaDato etiqueta="Estrato" valor={datos.estrato} />
              <FilaDato etiqueta="Ingresos del hogar" valor={datos.rango_ingresos} />
              <FilaDato etiqueta="Personas en el hogar" valor={datos.personas_hogar} />
              <FilaDato etiqueta="Educación de la madre" valor={datos.educacion_madre} />
              <FilaDato etiqueta="Educación del padre" valor={datos.educacion_padre} />
              <FilaDato etiqueta="Ocupación en el hogar" valor={datos.ocupacion_hogar} />
              <FilaDato etiqueta="Internet" valor={datos.tiene_internet === null ? null : datos.tiene_internet ? "Sí" : "No"} />
              <FilaDato etiqueta="Computador" valor={datos.tiene_computador === null ? null : datos.tiene_computador ? "Sí" : "No"} />
              <FilaDato etiqueta="Lavadora" valor={datos.tiene_lavadora === null ? null : datos.tiene_lavadora ? "Sí" : "No"} />
              <FilaDato etiqueta="Automóvil" valor={datos.tiene_automovil === null ? null : datos.tiene_automovil ? "Sí" : "No"} />
              <FilaDato etiqueta="Apoyo estatal" valor={datos.recibe_apoyo_estatal === null ? null : datos.recibe_apoyo_estatal ? "Sí" : "No"} />
              <FilaDato etiqueta="Trabaja" valor={datos.trabaja === null ? null : datos.trabaja ? "Sí" : "No"} />
            </dl>
          </div>

          {riasec.length > 0 && (
            <div className="rounded-xl border border-navy/10 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/40">
                Test de intereses (RIASEC)
              </p>
              <div className="space-y-1.5">
                {riasec.map((d) => (
                  <div key={d.dimension} className="flex items-center justify-between text-sm">
                    <span className={d.es_dominante ? "font-semibold text-navy" : "text-navy/60"}>
                      {DIMENSION_ETIQUETA[d.dimension] ?? d.dimension}
                    </span>
                    <span className="text-navy/40">{d.promedio.toFixed(1)}/5</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Seccion>
  );
}

function SeccionDatosBasicos({ usuario }) {
  const { actualizarUsuario } = useAuth();

  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [correo, setCorreo] = useState(usuario?.correo ?? "");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [cambiando, setCambiando] = useState(false);
  const [mensajeClave, setMensajeClave] = useState("");
  const [errorClave, setErrorClave] = useState("");

  async function guardarDatos(e) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setGuardando(true);
    try {
      await actualizarPerfil({ nombre, correo });
      actualizarUsuario({ nombre, correo });
      setMensaje("Tus datos se actualizaron correctamente.");
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  async function guardarClave(e) {
    e.preventDefault();
    setErrorClave("");
    setMensajeClave("");

    if (nuevaContrasena.length < 8) {
      setErrorClave("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setCambiando(true);
    try {
      await cambiarContrasena({ contrasena_actual: contrasenaActual, nueva_contrasena: nuevaContrasena });
      setMensajeClave("Tu contraseña se actualizó correctamente.");
      setContrasenaActual("");
      setNuevaContrasena("");
    } catch (err) {
      setErrorClave(mensajeDeError(err));
    } finally {
      setCambiando(false);
    }
  }

  return (
    <Seccion titulo="Tus datos">
      <form onSubmit={guardarDatos} className="space-y-3 rounded-xl border border-navy/10 p-4">
        <Alert tipo="error">{error}</Alert>
        {mensaje && <Alert tipo="exito">{mensaje}</Alert>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nombre completo" id="nombrePerfil">
            <input
              id="nombrePerfil"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={inputClasses(false)}
            />
          </Field>
          <Field label="Correo electrónico" id="correoPerfil">
            <input
              id="correoPerfil"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className={inputClasses(false)}
            />
          </Field>
        </div>
        <Button type="submit" variant="primary" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar datos"}
        </Button>
      </form>

      <form onSubmit={guardarClave} className="mt-3 space-y-3 rounded-xl border border-navy/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-navy/40">Cambiar contraseña</p>
        <Alert tipo="error">{errorClave}</Alert>
        {mensajeClave && <Alert tipo="exito">{mensajeClave}</Alert>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Contraseña actual" id="contrasenaActualPerfil">
            <input
              id="contrasenaActualPerfil"
              type="password"
              value={contrasenaActual}
              onChange={(e) => setContrasenaActual(e.target.value)}
              className={inputClasses(false)}
            />
          </Field>
          <Field label="Nueva contraseña" id="nuevaContrasenaPerfil">
            <input
              id="nuevaContrasenaPerfil"
              type="password"
              value={nuevaContrasena}
              onChange={(e) => setNuevaContrasena(e.target.value)}
              className={inputClasses(false)}
              placeholder="Mínimo 8 caracteres"
            />
          </Field>
        </div>
        <Button type="submit" variant="secondary" disabled={cambiando}>
          {cambiando ? "Cambiando..." : "Cambiar contraseña"}
        </Button>
      </form>
    </Seccion>
  );
}

function SeccionNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  function cargar() {
    obtenerNotificaciones()
      .then((data) => setNotificaciones(data.notificaciones))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }

  useEffect(cargar, []);

  async function marcarLeida(id) {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    marcarNotificacionLeida(id).catch(() => {});
  }

  async function marcarTodas() {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    marcarTodasLeidas().catch(() => {});
  }

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <Seccion titulo="Notificaciones">
      <Alert tipo="error">{error}</Alert>
      {noLeidas > 0 && (
        <button
          type="button"
          onClick={marcarTodas}
          className="mb-2 text-xs font-medium text-teal hover:underline"
        >
          Marcar todas como leídas
        </button>
      )}
      {cargando ? (
        <p className="text-sm text-navy/60">Cargando...</p>
      ) : notificaciones.length === 0 ? (
        <p className="text-sm text-navy/60">No tienes notificaciones todavía.</p>
      ) : (
        <div className="space-y-2">
          {notificaciones.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => marcarLeida(n.id)}
              className={`block w-full rounded-xl border p-3 text-left text-sm ${
                n.leida ? "border-navy/10 text-navy/60" : "border-teal/30 bg-mint/10 text-navy"
              }`}
            >
              <p className={n.leida ? "" : "font-medium"}>{n.mensaje}</p>
              <p className="mt-0.5 text-xs text-navy/40">{tiempoRelativo(n.creada_en)}</p>
            </button>
          ))}
        </div>
      )}
    </Seccion>
  );
}

function PerfilEstudiante({ usuario }) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="rounded-3xl border border-navy/5 bg-white p-8 shadow-xl shadow-teal/10">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint/40 text-teal">
          <IconShield className="h-5.5 w-5.5" />
        </span>

        <h1 className="mt-4 text-xl font-semibold text-navy">Mi perfil</h1>
        <p className="mt-1 text-sm text-navy/60">{usuario?.correo}</p>

        <SeccionResumen />
        <SeccionRecomendaciones />
        <SeccionAcudiente />
        <SeccionRespuestas />
        <SeccionDatosBasicos usuario={usuario} />
        <SeccionNotificaciones />

        <Link to="/panel" className="mt-8 block text-center text-sm font-medium text-teal hover:underline">
          Volver a mi panel
        </Link>
      </div>
    </main>
  );
}

export default function Perfil() {
  const { usuario } = useAuth();

  if (usuario && usuario.rol === "ADMINISTRADOR") {
    return <Navigate to="/panel" replace />;
  }

  return (
    <div className="min-h-screen bg-ice">
      <Navbar />
      {usuario?.rol === "ACUDIENTE" ? (
        <PerfilAcudiente usuario={usuario} />
      ) : usuario?.rol === "ESTUDIANTE" ? (
        <PerfilEstudiante usuario={usuario} />
      ) : (
        <main className="mx-auto max-w-3xl px-6 py-12 text-center text-sm text-navy/60">
          <IconSparkles className="mx-auto h-6 w-6" />
          Cargando...
        </main>
      )}
    </div>
  );
}
