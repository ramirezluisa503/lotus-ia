const ESTILOS = {
  error: "border-red-200 bg-red-50 text-red-700",
  exito: "border-mint/60 bg-mint/20 text-navy",
};

export default function Alert({ tipo = "error", children }) {
  if (!children) return null;
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${ESTILOS[tipo]}`} role="alert">
      {children}
    </div>
  );
}
