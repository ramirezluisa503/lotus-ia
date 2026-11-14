import { useRef, useState } from "react";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Field, { inputClasses } from "../../components/Field";
import { mensajeDeError } from "../../services/api";
import { extraerAcademicoDePdf } from "../../services/cuestionarioService";

export const AREAS_ACADEMICAS = [
  "Lectura crítica",
  "Matemáticas",
  "Sociales y ciudadanas",
  "Ciencias naturales",
  "Inglés",
];

const NIVELES_INGLES = ["A-", "A1", "A2", "B1", "B+"];

// Fórmula oficial del Puntaje Global del ICFES Saber 11 (Ministerio de
// Educación): índice global = (3×LC + 3×MAT + 3×SC + 3×CN + 1×Inglés) / 13,
// puntaje global = índice global × 5, redondeado al entero más cercano.
export function calcularPuntajeGlobalIcfes(valores) {
  const nota = (area) => Number(valores[area]);
  const notas = AREAS_ACADEMICAS.map(nota);
  if (notas.some((n) => Number.isNaN(n))) return null;

  const [lc, mat, soc, cn, ing] = notas;
  const indiceGlobal = (3 * lc + 3 * mat + 3 * soc + 3 * cn + 1 * ing) / 13;
  return Math.round(indiceGlobal * 5);
}

function SubirPdfIcfes({ onExtraido }) {
  const inputRef = useRef(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [listo, setListo] = useState(false);

  async function manejarArchivo(e) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;

    setError("");
    setListo(false);
    setCargando(true);
    try {
      const resultado = await extraerAcademicoDePdf(archivo);
      resultado.notas.forEach((n) => onExtraido(n.area, String(n.nota)));
      onExtraido("desempeno_ingles", resultado.desempeno_ingles);
      setListo(true);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="rounded-xl border border-dashed border-teal/40 bg-teal/5 px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
      <p className="text-sm font-medium text-navy">
        ¿Tienes el PDF de tu reporte oficial del ICFES?
      </p>
      <p className="mt-0.5 text-xs text-navy/60">
        Lo subes y llenamos las materias por ti. Igual podrás revisarlas antes de guardar.
      </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={manejarArchivo}
      />
      <Button
        type="button"
        variant="secondary"
        className="shrink-0"
        disabled={cargando}
        onClick={() => inputRef.current?.click()}
      >
        {cargando ? "Leyendo tu PDF..." : "Subir mi PDF del ICFES"}
      </Button>
      </div>

      {error && (
        <div className="mt-2.5">
          <Alert tipo="error">{error}</Alert>
        </div>
      )}
      {listo && !error && (
        <div className="mt-2.5">
          <Alert tipo="exito">
            Listo, revisa los campos de abajo y corrígelos si hace falta antes de guardar.
          </Alert>
        </div>
      )}
    </div>
  );
}

// Paso inicial: la persona elige de dónde salen sus puntajes (ICFES oficial o
// simulacro) y, si tiene el reporte oficial, puede subir el PDF.
export function PasoFuenteIcfes({ valores, onChange }) {
  const esSimulacro = Boolean(valores.es_simulacro);
  const opciones = [
    {
      simulacro: false,
      titulo: "Tengo mi resultado oficial",
      texto: "Ya presenté el ICFES Saber 11 y tengo mi reporte de resultados.",
    },
    {
      simulacro: true,
      titulo: "Aún no lo tengo",
      texto: "Voy en grado 10 o todavía no me lo entregan: usaré mi simulacro o pre-ICFES.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <p className="text-center text-sm text-navy/60">
        Para empezar, cuéntanos de dónde vienen tus puntajes por materia.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {opciones.map((op) => {
          const elegida = esSimulacro === op.simulacro;
          return (
            <button
              key={op.titulo}
              type="button"
              onClick={() => onChange("es_simulacro", op.simulacro)}
              className={
                "flex gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-colors " +
                (elegida ? "border-teal bg-teal/5" : "border-navy/10 hover:border-navy/25")
              }
            >
              <span
                className={
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 " +
                  (elegida ? "border-teal" : "border-navy/25")
                }
              >
                {elegida && <span className="h-2.5 w-2.5 rounded-full bg-teal" />}
              </span>
              <span>
                <span className="block font-semibold text-navy">{op.titulo}</span>
                <span className="mt-1 block text-sm text-navy/60">{op.texto}</span>
              </span>
            </button>
          );
        })}
      </div>

      <SubirPdfIcfes onExtraido={onChange} />
    </div>
  );
}

export default function PasoAcademico({ valores, errores = {}, onChange }) {
  const esSimulacro = Boolean(valores.es_simulacro);
  const puntajeGlobal = calcularPuntajeGlobalIcfes(valores);

  return (
    <div className="space-y-3">
      <p className="text-sm text-navy/60">
        {esSimulacro
          ? "Ingresa los resultados de tu simulacro o pre-ICFES más reciente (del 0 al 100 por materia)."
          : "Ingresa tus resultados del ICFES Saber 11 (los puedes ver en tu registro de resultados, del 0 al 100 por materia)."}
      </p>

      <div className="grid items-end gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {AREAS_ACADEMICAS.map((area) => (
          <Field key={area} label={`${area} (0-100)`} id={`nota-${area}`} error={errores[area]}>
            <input
              id={`nota-${area}`}
              type="number"
              required
              min={0}
              max={100}
              value={valores[area] ?? ""}
              onChange={(e) => onChange(area, e.target.value)}
              className={inputClasses(Boolean(errores[area]))}
              placeholder="Ej. 65"
            />
          </Field>
        ))}

        <Field label="Nivel de inglés (resultado ICFES)" id="desempeno-ingles" error={errores.desempeno_ingles}>
          <select
            id="desempeno-ingles"
            required
            value={valores.desempeno_ingles ?? ""}
            onChange={(e) => onChange("desempeno_ingles", e.target.value)}
            className={inputClasses(Boolean(errores.desempeno_ingles))}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {NIVELES_INGLES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex items-center justify-between rounded-xl bg-ice/70 px-4 py-2">
        <div>
          <p className="text-sm font-medium text-navy">Puntaje global ICFES (0-500)</p>
          <p className="text-xs text-navy/50">Se calcula solo con la fórmula oficial del ICFES.</p>
        </div>
        <p className="text-2xl font-bold text-teal">{puntajeGlobal ?? "—"}</p>
      </div>
    </div>
  );
}
