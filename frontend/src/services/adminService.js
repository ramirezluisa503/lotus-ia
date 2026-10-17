import api from "./api";

// Instituciones
export const listarInstitucionesAdmin = () => api.get("/admin/instituciones").then((r) => r.data);
export const crearInstitucion = (datos) => api.post("/admin/instituciones", datos).then((r) => r.data);
export const actualizarInstitucion = (id, datos) =>
  api.put(`/admin/instituciones/${id}`, datos).then((r) => r.data);

// Carreras
export const listarCarrerasAdmin = () => api.get("/admin/carreras").then((r) => r.data);
export const crearCarrera = (datos) => api.post("/admin/carreras", datos).then((r) => r.data);
export const actualizarCarrera = (id, datos) =>
  api.put(`/admin/carreras/${id}`, datos).then((r) => r.data);

// Becas
export const listarBecasAdmin = () => api.get("/admin/becas").then((r) => r.data);
export const crearBeca = (datos) => api.post("/admin/becas", datos).then((r) => r.data);
export const actualizarBeca = (id, datos) => api.put(`/admin/becas/${id}`, datos).then((r) => r.data);

// Modelos de IA
export const listarModelos = () => api.get("/admin/modelos").then((r) => r.data);
export const activarModelo = (id) => api.put(`/admin/modelos/${id}/activar`).then((r) => r.data);
