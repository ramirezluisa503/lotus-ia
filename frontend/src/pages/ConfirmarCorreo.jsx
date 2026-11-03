import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Alert from "../components/Alert";
import Button from "../components/Button";
import Logo from "../components/Logo";
import { mensajeDeError } from "../services/api";
import { confirmarCorreo } from "../services/authService";

export default function ConfirmarCorreo() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [estado, setEstado] = useState("confirmando"); // confirmando | listo | error
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setEstado("error");
      setError("Este enlace no es válido.");
      return;
    }
    confirmarCorreo({ token })
      .then(() => setEstado("listo"))
      .catch((err) => {
        setEstado("error");
        setError(mensajeDeError(err));
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ice px-6">
      <div className="w-full max-w-sm rounded-3xl border border-navy/5 bg-white p-8 text-center shadow-xl shadow-teal/10">
        <div className="flex justify-center">
          <Logo />
        </div>

        {estado === "confirmando" && (
          <p className="mt-6 text-sm text-navy/60">Confirmando tu correo...</p>
        )}

        {estado === "listo" && (
          <div className="mt-6 space-y-4">
            <Alert tipo="exito">Tu correo quedó confirmado. Ya puedes iniciar sesión.</Alert>
            <Link to="/login">
              <Button variant="primary" className="w-full">
                Ir a iniciar sesión
              </Button>
            </Link>
          </div>
        )}

        {estado === "error" && (
          <div className="mt-6 space-y-4">
            <Alert tipo="error">{error}</Alert>
            <Link to="/login">
              <Button variant="secondary" className="w-full">
                Ir a iniciar sesión
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
