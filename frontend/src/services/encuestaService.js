import api from "./api";

export function calificarRecomendacion({ recomendacionId, calificacion, comentario }) {
  return api
    .post("/encuestas", { recomendacion_id: recomendacionId, calificacion, comentario })
    .then((res) => res.data);
}
