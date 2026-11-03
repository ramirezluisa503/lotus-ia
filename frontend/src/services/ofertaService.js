import api from "./api";

export function listarAreas() {
  return api.get("/oferta/areas").then((res) => res.data);
}

export function listarCarreras({ costoMax } = {}) {
  return api
    .get("/oferta/carreras", {
      params: { costo_max: costoMax },
    })
    .then((res) => res.data);
}

export function listarBecas({ area } = {}) {
  return api.get("/oferta/becas", { params: { area } }).then((res) => res.data);
}
