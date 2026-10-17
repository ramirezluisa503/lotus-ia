import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("lotusia_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Traduce los errores del backend (ver Tabla 51, Capítulo 9) a mensajes para el usuario.
export function mensajeDeError(error) {
  if (!error.response) {
    return "No pudimos conectarnos con el servidor. Verifica tu conexión e inténtalo de nuevo.";
  }
  const { status, data } = error.response;
  if (data?.detail) return data.detail;
  if (status === 400 || status === 422) return "Revisa los campos marcados en rojo.";
  if (status === 401) return "Tu sesión terminó. Vuelve a iniciar sesión.";
  if (status === 429) return "Demasiados intentos. Espera unos minutos antes de volver a intentarlo.";
  return "Ocurrió un error inesperado. Inténtalo de nuevo.";
}

export default api;
