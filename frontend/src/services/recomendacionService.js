import api from "./api";

export function generarRecomendacion() {
  return api.post("/recomendaciones").then((res) => res.data);
}

export function obtenerHistorialRecomendaciones() {
  return api.get("/recomendaciones").then((res) => res.data);
}
