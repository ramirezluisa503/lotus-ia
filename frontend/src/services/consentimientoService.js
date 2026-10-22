import api from "./api";

export function otorgarConsentimientoAcudiente(aceptado) {
  return api.post("/consentimientos/acudiente", { aceptado }).then((res) => res.data);
}

export function otorgarAsentimientoEstudiante(aceptado) {
  return api.post("/consentimientos/asentimiento", { aceptado }).then((res) => res.data);
}

export function obtenerEstadoAutorizacion() {
  return api.get("/consentimientos/estado").then((res) => res.data);
}

export function obtenerEstadoAutorizacionAcudiente() {
  return api.get("/consentimientos/estado-acudiente").then((res) => res.data);
}
