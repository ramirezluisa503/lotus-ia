import { Component } from "react";
import Button from "./Button";

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Error no controlado en la interfaz:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-ice px-6">
          <div className="w-full max-w-sm rounded-3xl border border-navy/5 bg-white p-8 text-center shadow-xl shadow-teal/10">
            <h1 className="text-lg font-semibold text-navy">Algo salió mal</h1>
            <p className="mt-2 text-sm text-navy/60">
              Ocurrió un error inesperado en la página. Intenta recargar.
            </p>
            <Button
              variant="primary"
              className="mt-6 w-full"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
