import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Field, { inputClasses } from "../components/Field";
import Navbar from "../components/Navbar";
import { IconArrowRight, IconHeart, IconSparkles } from "../components/icons";
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

// ---------------------------------------------------------------------------
// Perfil del estudiante: tablero con el avance arriba, lo que falta por hacer
// y la información en tarjetas.
// ---------------------------------------------------------------------------

function Tarjeta({ titulo, accion, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-navy/5 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      {(titulo || accion) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {titulo && <h2 className="font-semibold text-navy">{titulo}</h2>}
          {accion}
        </div>
      )}
      {children}
    </section>
  );
}

// Anillo de progreso: un círculo que se llena según el porcentaje.
function AnilloProgreso({ porcentaje }) {
  const radio = 42;
  const circunferencia = 2 * Math.PI * radio;
  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radio} fill="none" stroke="currentColor" strokeWidth="9" className="text-white/15" />
        <circle
          cx="50"
          cy="50"
          r={radio}
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - porcentaje / 100)}
          className="text-mint transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{porcentaje}%</span>
        <span className="text-[10px] uppercase tracking-wide text-white/60">completo</span>
      </span>
    </div>
  );
}

function BarraMini({ valor, total }) {
  const porcentaje = total === 0 ? 0 : Math.round((valor / total) * 100);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy/5">
      <div
        className="h-full rounded-full bg-linear-to-r from-mint to-teal transition-[width] duration-700"
        style={{ width: `${porcentaje}%` }}
      />
    </div>
  );
}

function siNo(valor) {
  if (valor === null || valor === undefined) return null;
  return valor ? "Sí" : "No";
}

function vacio(valor) {
  return valor === null || valor === undefined || valor === "";
}

// Arma la lista de pasos del perfil a partir de lo que ya hay guardado.
function calcularPasos({ autorizacion, respuestas, riasec, recomendaciones }) {
  const autorizado = Boolean(autorizacion?.puede_continuar);
  const r = respuestas;
  return [
    {
      id: "acudiente",
      titulo: "Autorización de tu acudiente",
      descripcion: "Tu madre, padre o tutor legal autoriza tu participación.",
      hecho: Boolean(autorizacion?.consentimiento_otorgado),
      to: "/autorizacion",
      accion: "Ir a mi autorización",
    },
    {
      id: "asentimiento",
      titulo: "Tu aceptación",
      descripcion: "Tú también confirmas que quieres participar.",
      hecho: Boolean(autorizacion?.asentimiento_otorgado),
      to: "/autorizacion",
      accion: "Aceptar",
    },
    {
      id: "academico",
      titulo: "Datos académicos",
      descripcion: "Tus puntajes del ICFES o de un simulacro.",
      hecho: Boolean(r && r.notas.length > 0 && !vacio(r.puntaje_global_icfes)),
      to: "/cuestionario",
      accion: "Responder",
      bloqueado: !autorizado,
    },
    {
      id: "sociodemografico",
      titulo: "Datos sociodemográficos",
      descripcion: "Tu edad, tu zona y tu colegio.",
      hecho: Boolean(r && !vacio(r.edad) && !vacio(r.cole_jornada)),
      to: "/cuestionario",
      accion: "Responder",
      bloqueado: !autorizado,
    },
    {
      id: "socioeconomico",
      titulo: "Datos socioeconómicos",
      descripcion: "Cómo es tu hogar y con qué recursos cuentas.",
      hecho: Boolean(r && !vacio(r.estrato) && !vacio(r.personas_hogar)),
      to: "/cuestionario",
      accion: "Responder",
      bloqueado: !autorizado,
    },
    {
      id: "intereses",
      titulo: "Test de intereses",
      descripcion: "Preguntas cortas sobre lo que te gusta hacer.",
      hecho: riasec.length > 0,
      to: "/cuestionario",
      accion: "Hacer el test",
      bloqueado: !autorizado,
    },
    {
      id: "recomendacion",
      titulo: "Tu recomendación",
      descripcion: "El área y el nivel de formación que encajan contigo.",
      hecho: recomendaciones.length > 0,
      to: "/resultado",
      accion: "Ver resultado",
      bloqueado: !autorizado,
    },
  ];
}

function ListaPendientes({ pasos }) {
  const siguiente = pasos.find((p) => !p.hecho && !p.bloqueado);
  const faltan = pasos.filter((p) => !p.hecho).length;

  return (
    <Tarjeta
      titulo="Lo que te falta"
      accion={
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            faltan === 0 ? "bg-mint text-navy" : "bg-ice text-teal"
          }`}
        >
          {faltan === 0 ? "¡Todo listo!" : `${faltan} pendiente${faltan === 1 ? "" : "s"}`}
        </span>
      }
    >
      <ol className="space-y-2">
        {pasos.map((paso, index) => {
          const esSiguiente = paso === siguiente;
          return (
            <li
              key={paso.id}
              className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${
                esSiguiente ? "bg-linear-to-r from-mint/40 to-cyan-light/40 ring-1 ring-teal/20" : "hover:bg-ice/60"
              } ${paso.bloqueado && !paso.hecho ? "opacity-55" : ""}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  paso.hecho
                    ? "bg-mint text-navy"
                    : esSiguiente
                      ? "bg-linear-to-br from-teal to-navy text-white"
                      : "border-2 border-navy/15 text-navy/40"
                }`}
              >
                {paso.hecho ? "✓" : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium ${paso.hecho ? "text-navy/50" : "text-navy"}`}>
                  {paso.titulo}
                  {esSiguiente && (
                    <span className="ml-2 rounded-full bg-teal px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Siguiente
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-navy/50">
                  {paso.bloqueado && !paso.hecho ? "Se desbloquea con tu autorización" : paso.descripcion}
                </p>
              </div>
              {paso.hecho ? (
                <span className="hidden text-xs font-medium text-teal sm:inline">Completado</span>
              ) : !paso.bloqueado ? (
                <Link
                  to={paso.to}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    esSiguiente ? "bg-teal text-white hover:bg-navy" : "text-teal hover:bg-ice"
                  }`}
                >
                  {paso.accion}
                  <IconArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Tarjeta>
  );
}

function FilaDato({ etiqueta, valor }) {
  return (
    <div className="flex justify-between gap-4 border-b border-navy/5 py-1.5 text-sm last:border-0">
      <dt className="text-navy/50">{etiqueta}</dt>
      <dd className={`text-right font-medium ${vacio(valor) ? "text-navy/30" : "text-navy"}`}>
        {vacio(valor) ? "—" : String(valor)}
      </dd>
    </div>
  );
}

// Un bloque del cuestionario: muestra cuántos datos ya tiene y la lista.
function BloqueRespuestas({ titulo, filas, nota }) {
  const llenos = filas.filter(([, v]) => !vacio(v)).length;
  const [abierto, setAbierto] = useState(false);
  const completo = llenos === filas.length;

  return (
    <div className="rounded-xl border border-navy/10 p-4">
      <button type="button" onClick={() => setAbierto((a) => !a)} className="w-full text-left">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-navy">{titulo}</p>
          <span className={`text-xs font-medium ${completo ? "text-teal" : "text-navy/50"}`}>
            {llenos}/{filas.length} {completo && "✓"}
          </span>
        </div>
        <div className="mt-2">
          <BarraMini valor={llenos} total={filas.length} />
        </div>
        <p className="mt-2 text-xs font-medium text-teal">{abierto ? "Ocultar respuestas" : "Ver respuestas"}</p>
      </button>
      {abierto && (
        <dl className="mt-3">
          {filas.map(([etiqueta, valor]) => (
            <FilaDato key={etiqueta} etiqueta={etiqueta} valor={valor} />
          ))}
          {nota && <p className="mt-1.5 text-xs text-navy/50">{nota}</p>}
        </dl>
      )}
    </div>
  );
}

function SeccionRespuestas({ datos, riasec }) {
  if (!datos) {
    return (
      <Tarjeta titulo="Historial de respuestas">
        <p className="text-sm text-navy/60">Todavía no hay respuestas guardadas.</p>
      </Tarjeta>
    );
  }

  const academico = [
    ...datos.notas.map((n) => [n.area, `${n.nota}/100`]),
    ["Puntaje global ICFES", datos.puntaje_global_icfes],
    ["Nivel de inglés", datos.desempeno_ingles],
  ];
  const sociodemografico = [
    ["Edad", datos.edad],
    ["Género", datos.genero],
    ["Zona", datos.zona],
    ["Tipo de institución", datos.tipo_institucion],
    ["Carácter del colegio", datos.cole_caracter],
    ["Jornada", datos.cole_jornada],
  ];
  const socioeconomico = [
    ["Estrato", datos.estrato],
    ["Ingresos del hogar", datos.rango_ingresos],
    ["Personas en el hogar", datos.personas_hogar],
    ["Educación de la madre", datos.educacion_madre],
    ["Educación del padre", datos.educacion_padre],
    ["Ocupación de la madre", datos.ocupacion_madre],
    ["Ocupación del padre", datos.ocupacion_padre],
    ["Internet", siNo(datos.tiene_internet)],
    ["Computador", siNo(datos.tiene_computador)],
    ["Lavadora", siNo(datos.tiene_lavadora)],
    ["Automóvil", siNo(datos.tiene_automovil)],
    ["Apoyo estatal", siNo(datos.recibe_apoyo_estatal)],
    ["Trabaja", siNo(datos.trabaja)],
  ];

  return (
    <Tarjeta
      titulo="Historial de respuestas"
      accion={<span className="text-xs text-navy/50">Lo que ya respondiste en tu cuestionario</span>}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <BloqueRespuestas
          titulo="Académico"
          filas={academico}
          nota={datos.es_simulacro ? "Estos puntajes son de un simulacro/pre-ICFES, no del resultado oficial." : null}
        />
        <BloqueRespuestas titulo="Sociodemográfico" filas={sociodemografico} />
        <BloqueRespuestas titulo="Socioeconómico" filas={socioeconomico} />
      </div>

      {riasec.length > 0 && (
        <div className="mt-5 rounded-xl bg-ice/60 p-4">
          <p className="text-sm font-semibold text-navy">Test de intereses (RIASEC)</p>
          <div className="mt-3 space-y-2.5">
            {riasec.map((d) => (
              <div key={d.dimension}>
                <div className="flex items-center justify-between text-xs">
                  <span className={d.es_dominante ? "font-semibold text-navy" : "text-navy/60"}>
                    {DIMENSION_ETIQUETA[d.dimension] ?? d.dimension}
                    {d.es_dominante && <span className="ml-1.5 text-teal">★ dominante</span>}
                  </span>
                  <span className="text-navy/50">{d.promedio.toFixed(1)}/5</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ${
                      d.es_dominante ? "bg-linear-to-r from-teal to-navy" : "bg-teal/40"
                    }`}
                    style={{ width: `${(d.promedio / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Tarjeta>
  );
}

function SeccionRecomendaciones({ recomendaciones, setRecomendaciones }) {
  const [error, setError] = useState("");
  const [borrandoId, setBorrandoId] = useState(null);

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
    <Tarjeta
      titulo="Tus recomendaciones"
      accion={
        <Link to="/resultado" className="text-xs font-medium text-teal hover:underline">
          Ver la más reciente →
        </Link>
      }
    >
      <Alert tipo="error">{error}</Alert>
      {recomendaciones.length === 0 ? (
        <div className="rounded-xl border border-dashed border-navy/15 p-5 text-center">
          <IconSparkles className="mx-auto h-6 w-6 text-teal/60" />
          <p className="mt-2 text-sm text-navy/60">Todavía no tienes ninguna recomendación generada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {recomendaciones.map((r) => (
            <div key={r.id} className="rounded-xl bg-linear-to-br from-teal to-navy p-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold">{r.area}</p>
                <span className="shrink-0 text-xs text-white/60">{tiempoRelativo(r.generada_en)}</span>
              </div>
              <p className="mt-1 text-xs text-white/75">
                Nivel: {NIVEL_ETIQUETA[r.nivel_formacion] ?? r.nivel_formacion}
              </p>
              {r.probabilidad !== null && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full rounded-full bg-mint" style={{ width: `${Math.round(r.probabilidad * 100)}%` }} />
                  </div>
                  <span className="text-xs font-medium text-mint">Afinidad {Math.round(r.probabilidad * 100)}%</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => borrar(r.id)}
                disabled={borrandoId === r.id}
                className="mt-3 text-xs font-medium text-white/70 hover:text-white hover:underline disabled:opacity-50"
              >
                {borrandoId === r.id ? "Borrando..." : "Borrar"}
              </button>
            </div>
          ))}
        </div>
      )}
    </Tarjeta>
  );
}

function SeccionAcudiente({ acudientes, autorizacion }) {
  return (
    <Tarjeta titulo="Quién es tu acudiente">
      {acudientes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-navy/15 p-4 text-sm text-navy/60">
          Todavía no tienes ningún acudiente registrado. Pídele que cree su cuenta y te vincule.
        </div>
      ) : (
        <div className="space-y-3">
          {acudientes.map((a) => (
            <div key={a.correo} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-mint to-cyan-light text-sm font-bold text-navy">
                {(a.nombre || a.correo).charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-navy">{a.nombre}</p>
                <p className="truncate text-xs text-navy/50">
                  {PARENTESCOS.find((p) => p.valor === a.parentesco)?.etiqueta ?? a.parentesco} · {a.correo}
                </p>
              </div>
              {autorizacion && (
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    autorizacion.consentimiento_otorgado ? "bg-mint/60 text-navy" : "bg-ice text-teal"
                  }`}
                >
                  {autorizacion.consentimiento_otorgado ? "✓ Autorizó" : "Pendiente"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </Tarjeta>
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
    <div className="grid gap-6 lg:grid-cols-2">
      <Tarjeta titulo="Tus datos">
        <form onSubmit={guardarDatos} className="space-y-3">
          <Alert tipo="error">{error}</Alert>
          {mensaje && <Alert tipo="exito">{mensaje}</Alert>}
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
          <Button type="submit" variant="primary" disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar datos"}
          </Button>
        </form>
      </Tarjeta>

      <Tarjeta titulo="Cambiar contraseña">
        <form onSubmit={guardarClave} className="space-y-3">
          <Alert tipo="error">{errorClave}</Alert>
          {mensajeClave && <Alert tipo="exito">{mensajeClave}</Alert>}
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
          <Button type="submit" variant="secondary" disabled={cambiando}>
            {cambiando ? "Cambiando..." : "Cambiar contraseña"}
          </Button>
        </form>
      </Tarjeta>
    </div>
  );
}

function SeccionNotificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerNotificaciones()
      .then((data) => setNotificaciones(data.notificaciones))
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }, []);

  function marcarLeida(id) {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leida: true } : n)));
    marcarNotificacionLeida(id).catch(() => {});
  }

  function marcarTodas() {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    marcarTodasLeidas().catch(() => {});
  }

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <Tarjeta
      titulo={
        <span className="flex items-center gap-2">
          Notificaciones
          {noLeidas > 0 && (
            <span className="rounded-full bg-teal px-2 py-0.5 text-[11px] font-semibold text-white">{noLeidas}</span>
          )}
        </span>
      }
      accion={
        noLeidas > 0 && (
          <button type="button" onClick={marcarTodas} className="text-xs font-medium text-teal hover:underline">
            Marcar todas como leídas
          </button>
        )
      }
    >
      <Alert tipo="error">{error}</Alert>
      {cargando ? (
        <p className="text-sm text-navy/60">Cargando...</p>
      ) : notificaciones.length === 0 ? (
        <p className="text-sm text-navy/60">No tienes notificaciones todavía.</p>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {notificaciones.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => marcarLeida(n.id)}
              className={`flex w-full gap-3 rounded-xl p-3 text-left text-sm transition-colors ${
                n.leida ? "text-navy/60 hover:bg-ice/60" : "bg-mint/15 text-navy hover:bg-mint/25"
              }`}
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.leida ? "bg-navy/15" : "bg-teal"}`} />
              <span>
                <span className={`block ${n.leida ? "" : "font-medium"}`}>{n.mensaje}</span>
                <span className="mt-0.5 block text-xs text-navy/40">{tiempoRelativo(n.creada_en)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </Tarjeta>
  );
}

function PerfilEstudiante({ usuario }) {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [estadoProceso, setEstadoProceso] = useState(null);
  const [autorizacion, setAutorizacion] = useState(null);
  const [respuestas, setRespuestas] = useState(null);
  const [riasec, setRiasec] = useState([]);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [acudientes, setAcudientes] = useState([]);

  useEffect(() => {
    // Cada consulta puede fallar por separado (p. ej. sin autorización algunas
    // responden 403): se usa lo que llegue y lo demás queda vacío.
    Promise.allSettled([
      obtenerMiEstado(),
      obtenerEstadoAutorizacion(),
      obtenerMisRespuestas(),
      obtenerPerfilPsicometrico(),
      obtenerHistorialRecomendaciones(),
      obtenerMiAcudiente(),
    ]).then(([estado, aut, resp, psico, recs, acuds]) => {
      if (estado.status === "fulfilled") setEstadoProceso(estado.value);
      else setError(mensajeDeError(estado.reason));
      if (aut.status === "fulfilled") setAutorizacion(aut.value);
      if (resp.status === "fulfilled") setRespuestas(resp.value);
      if (psico.status === "fulfilled") setRiasec(psico.value.dimensiones ?? []);
      if (recs.status === "fulfilled") setRecomendaciones(recs.value);
      if (acuds.status === "fulfilled") setAcudientes(acuds.value);
      setCargando(false);
    });
  }, []);

  const pasos = calcularPasos({ autorizacion, respuestas, riasec, recomendaciones });
  const hechos = pasos.filter((p) => p.hecho).length;
  const porcentaje = cargando ? 0 : Math.round((hechos / pasos.length) * 100);
  const nombre = usuario?.nombre || usuario?.correo?.split("@")[0] || "";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Encabezado con el avance */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-teal to-navy p-6 text-white shadow-xl shadow-teal/20 sm:p-8">
        <span className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-mint/25 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-cyan-light/20 blur-3xl" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-mint text-2xl font-bold text-navy shadow-lg shadow-navy/30">
              {nombre.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-mint">Mi perfil</p>
              <h1 className="truncate text-2xl font-bold sm:text-3xl">{nombre}</h1>
              <p className="truncate text-sm text-white/70">{usuario?.correo}</p>
              {estadoProceso && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                    Grado {estadoProceso.grado}°
                  </span>
                  <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                    {ESTADO_ETIQUETA[estadoProceso.estado_proceso] ?? estadoProceso.estado_proceso}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AnilloProgreso porcentaje={porcentaje} />
            <div className="text-sm">
              <p className="font-semibold">
                {hechos} de {pasos.length} pasos
              </p>
              <p className="max-w-40 text-white/70">
                {hechos === pasos.length ? "¡Completaste todo tu proceso!" : "Sigue así, ya vas avanzando."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-4">
        <Alert tipo="error">{error}</Alert>
      </div>

      {cargando ? (
        <p className="mt-10 text-center text-sm text-navy/60">Cargando tu perfil...</p>
      ) : (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <ListaPendientes pasos={pasos} />
              <SeccionRespuestas datos={respuestas} riasec={riasec} />
            </div>
            <div className="space-y-6">
              <SeccionAcudiente acudientes={acudientes} autorizacion={autorizacion} />
              <SeccionRecomendaciones recomendaciones={recomendaciones} setRecomendaciones={setRecomendaciones} />
              <SeccionNotificaciones />
            </div>
          </div>

          <div className="mt-6">
            <SeccionDatosBasicos usuario={usuario} />
          </div>
        </>
      )}

      <Link to="/panel" className="mt-8 block text-center text-sm font-medium text-teal hover:underline">
        Volver a mi panel
      </Link>
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
