import api from "./api";

export function registrar({
  nombre,
  correo,
  contrasena,
  rol,
  documento,
  grado,
  correo_estudiante,
  parentesco,
}) {
  return api
    .post("/auth/registro", {
      nombre,
      correo,
      contrasena,
      rol,
      documento,
      grado,
      correo_estudiante,
      parentesco,
    })
    .then((res) => res.data);
}

export function iniciarSesion({ correo, contrasena }) {
  return api.post("/auth/login", { correo, contrasena }).then((res) => res.data);
}

export function obtenerUsuarioActual() {
  return api.get("/auth/me").then((res) => res.data);
}
