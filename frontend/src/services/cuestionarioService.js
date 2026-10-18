import api from "./api";

export function guardarAcademico(datos) {
  return api.put("/cuestionario/academico", datos).then((res) => res.data);
}

export function guardarSociodemografico(datos) {
  return api.put("/cuestionario/sociodemografico", datos).then((res) => res.data);
}

export function guardarSocioeconomico(datos) {
  return api.put("/cuestionario/socioeconomico", datos).then((res) => res.data);
}

export function obtenerInstrumentoActivo() {
  return api.get("/instrumentos/activo").then((res) => res.data);
}

export function guardarPsicometrico(respuestas) {
  return api.put("/cuestionario/psicometrico", { respuestas }).then((res) => res.data);
}
