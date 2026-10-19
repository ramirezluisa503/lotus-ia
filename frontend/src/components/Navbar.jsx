import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";
import Logo from "./Logo";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function cerrarSesion() {
    logout();
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-navy/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          {usuario ? (
            <>
              <span className="hidden text-sm text-navy/60 sm:inline">
                {usuario.correo}
              </span>
              <Button variant="secondary" onClick={cerrarSesion}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button as="a" href="/login" variant="secondary" className="hidden sm:inline-flex">
                Iniciar sesión
              </Button>
              <Button as="a" href="/registro" variant="primary">
                Registrarme
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
