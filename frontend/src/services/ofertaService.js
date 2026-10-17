import api from "./api";

export function listarAreas() {
  return api.get("/oferta/areas").then((res) => res.data);
}

export function listarCarreras({ area, nivel, costoMax } = {}) {
  return api
    .get("/oferta/carreras", {
      params: { area, nivel, costo_max: costoMax },
    })
    .then((res) => res.data);
}

export function listarBecas({ area } = {}) {
  return api.get("/oferta/becas", { params: { area } }).then((res) => res.data);
}
