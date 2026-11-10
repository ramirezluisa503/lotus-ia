import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import Notificaciones from "./Notificaciones";

const ROL_ETIQUETA = {
  ESTUDIANTE: "Estudiante",
  ACUDIENTE: "Acudiente",
  ADMINISTRADOR: "Administrador",
};

function IconUsuario({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </svg>
  );
}

// Ícono de perfil: al hacer clic abre un menú pequeño con "Mi perfil" y
// "Cerrar sesión".
function MenuPerfil({ usuario, alCerrarSesion }) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef(null);

  useEffect(() => {
    function alHacerClicFuera(e) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener("mousedown", alHacerClicFuera);
    return () => document.removeEventListener("mousedown", alHacerClicFuera);
  }, []);

  const tienePerfil = usuario.rol === "ESTUDIANTE" || usuario.rol === "ACUDIENTE";
  const opcion = "block w-full px-4 py-2.5 text-left text-sm text-navy transition-colors hover:bg-ice/70";

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Mi cuenta"
        aria-expanded={abierto}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          abierto ? "bg-teal text-white" : "bg-ice text-teal hover:bg-teal hover:text-white"
        }`}
      >
        <IconUsuario className="h-5 w-5" />
      </button>

      {abierto && (
        <div className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-xl shadow-teal/10">
          <div className="border-b border-navy/5 px-4 py-3">
            <p className="truncate text-sm font-semibold text-navy">{usuario.nombre || usuario.correo}</p>
            <p className="truncate text-xs text-navy/50">
              {ROL_ETIQUETA[usuario.rol] ?? usuario.rol} · {usuario.correo}
            </p>
          </div>
          {tienePerfil && (
            <Link to="/perfil" onClick={() => setAbierto(false)} className={opcion}>
              Mi perfil
            </Link>
          )}
          <button type="button" onClick={alCerrarSesion} className={`${opcion} border-t border-navy/5`}>
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

// Barra de navegación de toda la plataforma: blanca y fija arriba al bajar.
// Con sesión: logo a la izquierda; notificaciones y perfil a la derecha.
export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function cerrarSesion() {
    logout();
    navigate("/");
  }

  const enlacesVisitante = [
    { etiqueta: "Inicio", to: "/", exacto: true },
    { etiqueta: "Cómo funciona", href: "/#como-funciona" },
    { etiqueta: "Iniciar sesión", to: "/login" },
  ];

  function claseEnlace({ isActive }) {
    return `whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
      isActive ? "bg-teal text-white" : "text-navy/75 hover:bg-white hover:text-navy"
    }`;
  }

  const grupoEnlaces = (
    <div className="flex items-center gap-1 rounded-full bg-ice/80 p-1.5">
      {enlacesVisitante.map((e) =>
        e.href ? (
          <a key={e.etiqueta} href={e.href} className={claseEnlace({ isActive: false })}>
            {e.etiqueta}
          </a>
        ) : (
          <NavLink key={e.etiqueta} to={e.to} end={e.exacto} className={claseEnlace}>
            {e.etiqueta}
          </NavLink>
        )
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-navy/5 bg-white/90 shadow-sm shadow-navy/5 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Logo />

        {usuario ? (
          <div className="flex items-center gap-2">
            <Notificaciones />
            <MenuPerfil usuario={usuario} alCerrarSesion={cerrarSesion} />
          </div>
        ) : (
          <>
            <nav className="hidden md:block">{grupoEnlaces}</nav>
            <Link
              to="/registro"
              className="rounded-full bg-mint px-5 py-2.5 text-sm font-medium text-navy shadow-sm transition-colors hover:bg-teal hover:text-white"
            >
              Registrarme
            </Link>
          </>
        )}
      </div>

      {/* Visitantes en celular: los enlaces van en una segunda fila deslizable */}
      {!usuario && (
        <nav className="overflow-x-auto px-6 pb-3 md:hidden">
          <div className="w-max">{grupoEnlaces}</div>
        </nav>
      )}
    </header>
  );
}
