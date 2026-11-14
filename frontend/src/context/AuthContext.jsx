import { createContext, useContext, useEffect, useState } from "react";
import { iniciarSesion, obtenerUsuarioActual } from "../services/authService";

const AuthContext = createContext(null);
const TOKEN_KEY = "lotusia_token";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setCargando(false);
      return;
    }
    obtenerUsuarioActual()
      .then(setUsuario)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setCargando(false));
  }, []);

  // Todas las pestañas del navegador comparten la misma sesión guardada. Si en
  // otra pestaña se inicia o se cierra sesión (por ejemplo con otra cuenta),
  // recargamos esta para que no quede mostrando a una persona mientras habla
  // con el servidor como otra.
  useEffect(() => {
    function alCambiarSesionEnOtraPestana(e) {
      if (e.key === TOKEN_KEY) window.location.reload();
    }
    window.addEventListener("storage", alCambiarSesionEnOtraPestana);
    return () => window.removeEventListener("storage", alCambiarSesionEnOtraPestana);
  }, []);

  async function login({ correo, contrasena }) {
    const data = await iniciarSesion({ correo, contrasena });
    localStorage.setItem(TOKEN_KEY, data.access_token);
    const usuarioActual = await obtenerUsuarioActual();
    setUsuario(usuarioActual);
    return usuarioActual;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUsuario(null);
  }

  function actualizarUsuario(cambios) {
    setUsuario((prev) => ({ ...prev, ...cambios }));
  }

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout, actualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
