import api from "./api";

export function obtenerNotificaciones() {
  return api.get("/notificaciones").then((res) => res.data);
}

export function marcarNotificacionLeida(id) {
  return api.post(`/notificaciones/${id}/leer`).then((res) => res.data);
}

export function marcarTodasLeidas() {
  return api.post("/notificaciones/leer-todas").then((res) => res.data);
}
