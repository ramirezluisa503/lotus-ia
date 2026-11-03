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
    <div className="rounded-lg border border-dashed border-teal/40 bg-teal/5 px-3 py-3">
      <p className="text-sm font-medium text-navy">
        ¿Tienes el PDF de tu reporte oficial del ICFES?
      </p>
      <p className="mt-0.5 text-xs text-navy/60">
        Lo subes y llenamos las 5 materias y el nivel de inglés por ti. Igual
        podrás revisar y corregir los datos antes de guardar.
      </p>

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
        className="mt-2.5"
        disabled={cargando}
        onClick={() => inputRef.current?.click()}
      >
        {cargando ? "Leyendo tu PDF..." : "Subir mi PDF del ICFES"}
      </Button>

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

export default function PasoAcademico({ valores, errores = {}, onChange }) {
  const esSimulacro = Boolean(valores.es_simulacro);
  const puntajeGlobal = calcularPuntajeGlobalIcfes(valores);

  return (
    <div className="space-y-4">
      <p className="text-sm text-navy/60">
        {esSimulacro
          ? "Ingresa los resultados de tu simulacro o pre-ICFES más reciente (del 0 al 100 por materia)."
          : "Ingresa tus resultados del ICFES Saber 11 (los puedes ver en tu registro de resultados, del 0 al 100 por materia)."}
      </p>

      <label className="flex items-start gap-2 rounded-lg border border-navy/15 bg-navy/2 px-3 py-2.5 text-sm text-navy/70">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={esSimulacro}
          onChange={(e) => onChange("es_simulacro", e.target.checked)}
        />
        <span>
          Aún no tengo el resultado oficial del ICFES (voy en grado 10 o
          todavía no me lo entregan) y quiero usar mi puntaje de simulacro o
          pre-ICFES mientras tanto.
        </span>
      </label>

      {!esSimulacro && <SubirPdfIcfes onExtraido={onChange} />}

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

      <Field label="Puntaje global ICFES (0-500)" id="puntaje-global">
        <div
          id="puntaje-global"
          className="w-full rounded-lg border border-navy/10 bg-ice/60 px-3.5 py-2.5 text-sm font-medium text-navy"
        >
          {puntajeGlobal ?? "—"}
        </div>
        <p className="mt-1.5 text-xs text-navy/50">
          Se calcula automáticamente con la fórmula oficial del ICFES a
          partir de las 5 materias de arriba.
        </p>
      </Field>

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
  );
}
