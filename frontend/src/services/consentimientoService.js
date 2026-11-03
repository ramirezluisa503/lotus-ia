import api from "./api";

export function otorgarConsentimientoAcudiente(estudianteUsuarioId, aceptado) {
  return api
    .post("/consentimientos/acudiente", { estudiante_usuario_id: estudianteUsuarioId, aceptado })
    .then((res) => res.data);
}

export function otorgarAsentimientoEstudiante(aceptado) {
  return api.post("/consentimientos/asentimiento", { aceptado }).then((res) => res.data);
}

export function obtenerEstadoAutorizacion() {
  return api.get("/consentimientos/estado").then((res) => res.data);
}

export function obtenerEstudiantesACargo() {
  return api.get("/consentimientos/estudiantes").then((res) => res.data);
}
