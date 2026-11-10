import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconBell } from "./icons";
import { useAuth } from "../context/AuthContext";
import {
  obtenerEstadoAutorizacion,
  obtenerEstudiantesACargo,
} from "../services/consentimientoService";
import {
  marcarNotificacionLeida,
  marcarTodasLeidas,
  obtenerNotificaciones,
} from "../services/notificacionService";

const INTERVALO_SONDEO_MS = 45000;

// Aviso fijo de autorización pendiente. No se guarda en la base de datos: se
// calcula cada vez a partir del estado real, así que desaparece solo cuando
// la autorización queda completa.
async function consultarPendiente(rol) {
  if (rol === "ESTUDIANTE") {
    const estado = await obtenerEstadoAutorizacion();
    if (estado.puede_continuar) return null;
    const faltaAcudiente = !estado.consentimiento_otorgado;
    const faltaTuya = !estado.asentimiento_otorgado;
    return {
      titulo: "Completa tu autorización para empezar",
      detalle:
        faltaAcudiente && faltaTuya
          ? "Falta la autorización de tu acudiente y tu aceptación."
          : faltaAcudiente
            ? "Falta la autorización de tu acudiente."
            : "Falta tu aceptación para participar.",
    };
  }
  if (rol === "ACUDIENTE") {
    const estudiantes = await obtenerEstudiantesACargo();
    const pendientes = estudiantes.filter((e) => !e.consentimiento_otorgado).length;
    if (pendientes === 0) return null;
    return {
      titulo: "Tienes una autorización pendiente",
      detalle:
        pendientes === 1
          ? "Un estudiante a tu cargo espera tu autorización para empezar."
          : `${pendientes} estudiantes a tu cargo esperan tu autorización.`,
    };
  }
  return null;
}

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

// claro: íconos blancos, para cuando la barra va encima de una foto oscura.
export default function Notificaciones({ claro = false }) {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const rol = usuario?.rol;
  const [pendiente, setPendiente] = useState(null);

  function cargar() {
    consultarPendiente(rol)
      .then(setPendiente)
      .catch(() => setPendiente(null));
    obtenerNotificaciones()
      .then((data) => {
        setNotificaciones(data.notificaciones);
        setNoLeidas(data.no_leidas);
      })
      .catch(() => {});
  }

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, INTERVALO_SONDEO_MS);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rol]);

  useEffect(() => {
    function alHacerClicFuera(e) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", alHacerClicFuera);
    return () => document.removeEventListener("mousedown", alHacerClicFuera);
  }, []);

  async function alHacerClicNotificacion(notificacion) {
    if (!notificacion.leida) {
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === notificacion.id ? { ...n, leida: true } : n))
      );
      setNoLeidas((prev) => Math.max(0, prev - 1));
      marcarNotificacionLeida(notificacion.id).catch(() => {});
    }
    setAbierto(false);
    if (notificacion.enlace) navigate(notificacion.enlace);
  }

  async function alMarcarTodas() {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    setNoLeidas(0);
    marcarTodasLeidas().catch(() => {});
  }

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          claro ? "text-white/85 hover:bg-white/15 hover:text-white" : "text-navy/60 hover:bg-navy/5 hover:text-navy"
        }`}
        aria-label="Notificaciones"
      >
        <IconBell className="h-5 w-5" />
        {noLeidas + (pendiente ? 1 : 0) > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
            {noLeidas + (pendiente ? 1 : 0) > 9 ? "9+" : noLeidas + (pendiente ? 1 : 0)}
          </span>
        )}
      </button>

      {abierto && (
        <div className="fixed inset-x-4 top-18 z-30 flex flex-col overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-xl shadow-teal/10 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96">
          <div className="flex shrink-0 items-center justify-between border-b border-navy/5 px-4 py-3">
            <p className="text-sm font-semibold text-navy">Notificaciones</p>
            {noLeidas > 0 && (
              <button
                type="button"
                onClick={alMarcarTodas}
                className="text-xs font-medium text-teal hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Alto máximo según la pantalla, para que nada quede por fuera */}
          <div className="max-h-[calc(100svh-9rem)] overflow-y-auto">
            {pendiente && (
              <button
                type="button"
                onClick={() => {
                  setAbierto(false);
                  navigate("/autorizacion");
                }}
                className="relative block w-full border-b border-navy/5 bg-linear-to-r from-mint/30 to-cyan-light/30 px-4 py-3 pl-5 text-left text-sm transition-colors hover:from-mint/45 hover:to-cyan-light/45"
              >
                <span className="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-mint to-teal" />
                <p className="text-[10px] font-semibold uppercase tracking-wide text-teal">Pendiente</p>
                <p className="mt-0.5 font-semibold text-navy">{pendiente.titulo}</p>
                <p className="mt-0.5 text-xs text-navy/60">{pendiente.detalle}</p>
                <p className="mt-1.5 text-xs font-medium text-teal">Completar ahora →</p>
              </button>
            )}
            {notificaciones.length === 0 && !pendiente ? (
              <p className="px-4 py-6 text-center text-sm text-navy/50">
                No tienes notificaciones todavía.
              </p>
            ) : (
              notificaciones.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => alHacerClicNotificacion(n)}
                  className={`block w-full border-b border-navy/5 px-4 py-3 text-left text-sm transition-colors last:border-0 hover:bg-ice/60 ${
                    n.leida ? "text-navy/60" : "bg-mint/10 text-navy"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!n.leida && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />}
                    <div className={n.leida ? "" : "flex-1"}>
                      <p className={n.leida ? "" : "font-medium"}>{n.mensaje}</p>
                      <p className="mt-0.5 text-xs text-navy/40">{tiempoRelativo(n.creada_en)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
