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

  return (
    <AuthContext.Provider value={{ usuario, cargando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
