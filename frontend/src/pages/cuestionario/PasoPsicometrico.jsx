const ESCALA = [
  { valor: 1, etiqueta: "Nada" },
  { valor: 2, etiqueta: "Poco" },
  { valor: 3, etiqueta: "Algo" },
  { valor: 4, etiqueta: "Bastante" },
  { valor: 5, etiqueta: "Mucho" },
];

// `desde`: número de la primera pregunta mostrada (el test se ve por partes).
export default function PasoPsicometrico({ preguntas, respuestas, onChange, cargando, desde = 0 }) {
  if (cargando) {
    return <p className="text-sm text-navy/60">Cargando preguntas...</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-navy/60">
        No hay respuestas correctas o incorrectas: responde qué tanto se
        parece cada frase a ti.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {preguntas.map((p, index) => (
        <div key={p.id} className="flex flex-col justify-between rounded-xl border border-navy/10 p-3.5">
          <p className="text-sm font-medium text-navy">
            {desde + index + 1}. {p.enunciado}
          </p>
          <div className="mt-2.5 grid grid-cols-5 gap-1">
            {ESCALA.map((opcion) => (
              <button
                key={opcion.valor}
                type="button"
                onClick={() => onChange(p.id, opcion.valor)}
                className={`rounded-lg border px-1 py-2 text-center text-[11px] font-medium transition-colors ${
                  respuestas[p.id] === opcion.valor
                    ? "border-teal bg-teal/10 text-teal"
                    : "border-navy/15 text-navy/50 hover:border-navy/30"
                }`}
              >
                {opcion.etiqueta}
              </button>
            ))}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
