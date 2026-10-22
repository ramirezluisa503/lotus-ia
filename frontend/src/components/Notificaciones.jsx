import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconBell } from "./icons";
import {
  marcarNotificacionLeida,
  marcarTodasLeidas,
  obtenerNotificaciones,
} from "../services/notificacionService";

const INTERVALO_SONDEO_MS = 45000;

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

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);
  const navigate = useNavigate();

  function cargar() {
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
  }, []);

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
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-navy/60 transition-colors hover:bg-navy/5 hover:text-navy"
        aria-label="Notificaciones"
      >
        <IconBell className="h-5 w-5" />
        {noLeidas > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">
            {noLeidas > 9 ? "9+" : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-xl shadow-teal/10">
          <div className="flex items-center justify-between border-b border-navy/5 px-4 py-3">
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

          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
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
