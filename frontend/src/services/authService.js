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

export function olvideContrasena({ correo }) {
  return api.post("/auth/olvide-contrasena", { correo }).then((res) => res.data);
}

export function restablecerContrasena({ token, nueva_contrasena }) {
  return api
    .post("/auth/restablecer-contrasena", { token, nueva_contrasena })
    .then((res) => res.data);
}
