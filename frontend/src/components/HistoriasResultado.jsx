import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconArrowRight, IconShield } from "./icons";

// Resultado contado como "historias" (estilo Wrapped): una idea por pantalla,
// primero lo que la persona nos contó y al final la recomendación, para que se
// entienda de dónde sale. Tono honesto: no se muestran porcentajes que el
// modelo no calcula y se aclara qué parte decide la recomendación y qué no.

const NIVEL_ETIQUETA = {
  TECNICO_PROFESIONAL: "Técnico profesional",
  TECNOLOGICO: "Tecnológico",
  UNIVERSITARIO: "Universitario",
};

const DIMENSIONES = {
  REALISTA: { nombre: "Realista", texto: "Te gusta trabajar con tus manos, con herramientas, máquinas o al aire libre." },
  INVESTIGADOR: { nombre: "Investigador", texto: "Te gusta analizar, observar y resolver problemas con ideas." },
  ARTISTICO: { nombre: "Artístico", texto: "Te gusta crear, imaginar y expresarte de formas originales." },
  SOCIAL: { nombre: "Social", texto: "Te gusta ayudar, enseñar y trabajar con otras personas." },
  EMPRENDEDOR: { nombre: "Emprendedor", texto: "Te gusta liderar, convencer y sacar proyectos adelante." },
  CONVENCIONAL: { nombre: "Convencional", texto: "Te gusta el orden, los datos y seguir procesos claros." },
};

function prefiereMenosMovimiento() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Devuelve false en el primer cuadro y true en el siguiente: sirve para que
// las barras arranquen en 0 y se llenen con transición.
function useMontado() {
  const [montado, setMontado] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMontado(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return montado;
}

// Número que "se cuenta solo" desde 0 hasta el objetivo.
function useContador(objetivo, duracion = 1400, retraso = 300) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    if (objetivo == null) return undefined;
    if (prefiereMenosMovimiento()) {
      const id = requestAnimationFrame(() => setValor(objetivo));
      return () => cancelAnimationFrame(id);
    }
    let frame;
    let inicio;
    const temporizador = setTimeout(() => {
      function paso(t) {
        if (inicio === undefined) inicio = t;
        const avance = Math.min(1, (t - inicio) / duracion);
        const suavizado = 1 - Math.pow(1 - avance, 3);
        setValor(Math.round(objetivo * suavizado));
        if (avance < 1) frame = requestAnimationFrame(paso);
      }
      frame = requestAnimationFrame(paso);
    }, retraso);
    return () => {
      clearTimeout(temporizador);
      cancelAnimationFrame(frame);
    };
  }, [objetivo, duracion, retraso]);
  return valor;
}

function Aparece({ retraso = 0, className = "", children }) {
  return (
    <div className={`historia-aparecer ${className}`} style={{ animationDelay: `${retraso}ms` }}>
      {children}
    </div>
  );
}

function formatear(numero) {
  return Number.isInteger(numero) ? String(numero) : numero.toFixed(1).replace(".", ",");
}

// ------------------------------- Pantallas -------------------------------

function PantallaIntro({ nombre }) {
  return (
    <div className="flex min-h-full flex-col justify-center py-2">
      <Aparece>
        <p className="text-lg font-medium text-mint">Tu resultado, paso a paso</p>
      </Aparece>
      <Aparece retraso={250}>
        <h2 className="mt-3 text-4xl font-bold leading-tight sm:text-6xl">
          Hola{nombre ? `, ${nombre}` : ""}.
        </h2>
      </Aparece>
      <Aparece retraso={600}>
        <p className="mt-6 max-w-lg text-lg text-white/85 sm:text-xl">
          Antes de mostrarte tu recomendación, repasemos lo que nos contaste.
          Así vas a entender de dónde sale.
        </p>
      </Aparece>
      <Aparece retraso={1000}>
        <p className="mt-10 text-sm text-white/60">Toca la pantalla o usa las flechas del teclado para avanzar.</p>
      </Aparece>
    </div>
  );
}

function PantallaMaterias({ notas }) {
  const montado = useMontado();
  const ordenadas = [...notas].sort((a, b) => b.nota - a.nota);
  const mejor = ordenadas[0];

  return (
    <div className="flex min-h-full flex-col justify-center py-2">
      <Aparece>
        <p className="text-lg font-medium text-mint">Tus puntajes por materia</p>
      </Aparece>
      <Aparece retraso={200}>
        <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-5xl">
          Tu materia más fuerte es <span className="text-mint">{mejor.area}</span>.
        </h2>
      </Aparece>
      <div className="mt-8 space-y-3.5">
        {ordenadas.map((n, i) => (
          <Aparece key={n.area} retraso={500 + i * 150}>
            <div className="flex items-center justify-between text-sm">
              <span className={n === mejor ? "font-semibold" : "text-white/80"}>{n.area}</span>
              <span className={n === mejor ? "font-semibold text-mint" : "text-white/70"}>{n.nota}</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/15">
              <div
                className={`h-full rounded-full transition-[width] duration-1000 ease-out ${n === mejor ? "bg-mint" : "bg-white/50"}`}
                style={{ width: montado ? `${n.nota}%` : "0%", transitionDelay: `${600 + i * 150}ms` }}
              />
            </div>
          </Aparece>
        ))}
      </div>
    </div>
  );
}

function PantallaGlobal({ puntaje, ingles, esSimulacro }) {
  const valor = useContador(puntaje);
  return (
    <div className="flex min-h-full flex-col justify-center py-2">
      <Aparece>
        <p className="text-lg font-medium text-teal">Tu puntaje global</p>
      </Aparece>
      <Aparece retraso={200}>
        <p className="mt-2 text-7xl font-bold tabular-nums text-navy sm:text-9xl">
          {valor}
          <span className="text-3xl text-navy/40 sm:text-5xl"> / 500</span>
        </p>
      </Aparece>
      {ingles && (
        <Aparece retraso={700}>
          <p className="mt-6 text-xl text-navy/80">
            Y tu nivel de inglés es <span className="font-bold text-teal">{ingles}</span>.
          </p>
        </Aparece>
      )}
      <Aparece retraso={1000}>
        <p className="mt-8 max-w-lg text-sm text-navy/60">
          El puntaje global se calcula con la fórmula oficial del ICFES a partir de tus 5 materias.
        </p>
        {esSimulacro && (
          <p className="mt-3 max-w-lg rounded-xl bg-white/60 px-4 py-3 text-sm font-medium text-navy">
            Ojo: estos puntajes son de un simulacro o pre-ICFES, no de tu resultado oficial.
            Tu recomendación podría cambiar cuando tengas el resultado real.
          </p>
        )}
      </Aparece>
    </div>
  );
}

function PantallaIntereses({ dimensiones }) {
  const montado = useMontado();
  const dominantes = dimensiones.filter((d) => d.es_dominante);
  const nombres = dominantes.map((d) => DIMENSIONES[d.dimension]?.nombre ?? d.dimension).join(" y ");
  const ordenadas = [...dimensiones].sort((a, b) => b.promedio - a.promedio);

  return (
    <div className="flex min-h-full flex-col justify-center py-2">
      <Aparece>
        <p className="text-lg font-medium text-mint">Lo que te mueve</p>
      </Aparece>
      <Aparece retraso={200}>
        <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-5xl">
          Tu perfil de intereses es <span className="text-mint">{nombres}</span>.
        </h2>
      </Aparece>
      {dominantes.length === 1 && DIMENSIONES[dominantes[0].dimension] && (
        <Aparece retraso={450}>
          <p className="mt-3 text-lg text-white/85">{DIMENSIONES[dominantes[0].dimension].texto}</p>
        </Aparece>
      )}
      <div className="mt-6 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {ordenadas.map((d, i) => (
          <Aparece key={d.dimension} retraso={650 + i * 100}>
            <div className="flex items-center justify-between text-sm">
              <span className={d.es_dominante ? "font-semibold" : "text-white/75"}>
                {DIMENSIONES[d.dimension]?.nombre ?? d.dimension}
              </span>
              <span className="text-white/60">{formatear(d.promedio)}/5</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className={`h-full rounded-full transition-[width] duration-1000 ease-out ${d.es_dominante ? "bg-mint" : "bg-white/45"}`}
                style={{ width: montado ? `${(d.promedio / 5) * 100}%` : "0%", transitionDelay: `${700 + i * 100}ms` }}
              />
            </div>
          </Aparece>
        ))}
      </div>
      <Aparece retraso={1400}>
        <p className="mt-7 max-w-xl rounded-xl bg-white/10 px-4 py-3 text-sm text-white/85">
          Para ser claros: este test <strong>no</strong> lo usa el modelo para elegir tu área. Te lo
          mostramos para que compares tus gustos con la recomendación y saques tus propias conclusiones.
        </p>
      </Aparece>
    </div>
  );
}

function TarjetaRazon({ razon }) {
  const encima = razon.direccion === "por_encima";
  return (
    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold">{razon.nombre}</p>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${encima ? "bg-mint text-navy" : "bg-white/20 text-white"}`}
        >
          {encima ? "Por encima" : "Por debajo"}
        </span>
      </div>
      {razon.valor !== null && razon.referencia !== null ? (
        <p className="mt-1.5 text-sm text-white/80">
          Tu valor: <strong className="text-white">{formatear(razon.valor)}</strong>. El modelo usa{" "}
          <strong className="text-white">{formatear(razon.referencia)}</strong> como punto de corte para
          separar perfiles, y quedaste {encima ? "por encima" : "por debajo"}.
        </p>
      ) : (
        <p className="mt-1.5 text-sm text-white/80">
          El modelo tuvo en cuenta este dato de tu contexto y quedaste {encima ? "por encima" : "por debajo"} de
          su punto de corte.
        </p>
      )}
    </div>
  );
}

function PantallaRazones({ razones, explicacion }) {
  return (
    <div className="flex min-h-full flex-col justify-center py-2">
      <Aparece>
        <p className="text-lg font-medium text-mint">En qué se fijó el modelo</p>
      </Aparece>
      <Aparece retraso={200}>
        <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-4xl">
          Un árbol de decisión se hace preguntas sobre tu perfil, una tras otra.
        </h2>
      </Aparece>
      <Aparece retraso={450}>
        <p className="mt-3 max-w-xl text-white/80">
          Fue entrenado con resultados del ICFES de estudiantes de Risaralda. Para ti, estas fueron
          las preguntas que más pesaron:
        </p>
      </Aparece>
      {razones.length > 0 ? (
        <div className="mt-6 space-y-3">
          {razones.map((r, i) => (
            <Aparece key={r.variable} retraso={900 + i * 500}>
              <TarjetaRazon razon={r} />
            </Aparece>
          ))}
        </div>
      ) : (
        <Aparece retraso={900}>
          <p className="mt-6 rounded-2xl bg-white/10 p-4 text-white/90">{explicacion}</p>
        </Aparece>
      )}
    </div>
  );
}

function PantallaRevelacion({ area, nivel }) {
  return (
    <div className="flex min-h-full flex-col justify-center py-2 text-center">
      <Aparece>
        <p className="text-lg font-medium text-navy/70">Con todo eso, el área que mejor encaja con tu perfil es…</p>
      </Aparece>
      <Aparece retraso={1300}>
        <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight text-navy sm:text-6xl">{area}</h2>
      </Aparece>
      <Aparece retraso={2100}>
        <p className="mt-6 text-xl text-navy/80">
          Nivel sugerido: <span className="font-bold text-teal">{NIVEL_ETIQUETA[nivel] ?? nivel}</span>
        </p>
      </Aparece>
      <Aparece retraso={2600}>
        <p className="mx-auto mt-4 max-w-xl text-sm text-navy/65">
          El nivel no sale de tus puntajes: se calcula con tu contexto (estrato, si tienes internet y
          computador en casa, y la educación de tus padres), para sugerirte algo viable hoy. No es un
          límite: puedes aspirar a otro nivel.
        </p>
      </Aparece>
    </div>
  );
}

function PantallaOferta({ carreras, becas }) {
  return (
    <div className="flex min-h-full flex-col justify-center py-2">
      <Aparece>
        <p className="text-lg font-medium text-mint">Dónde podrías estudiarlo</p>
      </Aparece>
      <Aparece retraso={200}>
        <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-5xl">Opciones en Pereira</h2>
      </Aparece>
      {carreras.length > 0 ? (
        <div className="mt-7 space-y-3">
          {carreras.slice(0, 3).map((c, i) => (
            <Aparece key={c.id} retraso={500 + i * 250}>
              <div className="rounded-2xl bg-white/10 px-4 py-3">
                <p className="font-semibold">{c.nombre}</p>
                <p className="text-sm text-white/70">{c.institucion}</p>
              </div>
            </Aparece>
          ))}
        </div>
      ) : (
        <Aparece retraso={500}>
          <p className="mt-6 text-white/80">Todavía no tenemos programas registrados para esta área y nivel.</p>
        </Aparece>
      )}
      <Aparece retraso={1400}>
        <p className="mt-6 text-lg">
          {carreras.length > 3 && <>Y {carreras.length - 3} programas más. </>}
          {becas.length > 0 ? (
            <>
              Además hay <span className="font-bold text-mint">{becas.length} {becas.length === 1 ? "beca" : "becas"}</span>{" "}
              que podrías revisar.
            </>
          ) : null}
        </p>
      </Aparece>
    </div>
  );
}

function PantallaResumen({ datos, alVerDetalle, alRepetir }) {
  const { recomendacion, mejorMateria, dominante, puntajeGlobal } = datos;
  const filas = [
    ["Área recomendada", recomendacion.area],
    ["Nivel sugerido", NIVEL_ETIQUETA[recomendacion.nivel_formacion] ?? recomendacion.nivel_formacion],
    mejorMateria && ["Tu materia más fuerte", `${mejorMateria.area} (${mejorMateria.nota})`],
    puntajeGlobal != null && ["Puntaje global", `${puntajeGlobal} / 500`],
    dominante && ["Tu interés más marcado", dominante],
  ].filter(Boolean);

  return (
    <div className="flex min-h-full flex-col justify-center py-2">
      <Aparece>
        {/* Resumen compacto: el área ocupa todo el ancho y el resto va en dos
            columnas, para que la tarjeta y los botones quepan en la pantalla. */}
        <div className="mx-auto w-full max-w-xl rounded-3xl bg-white p-5 text-navy shadow-2xl shadow-navy/40 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal">Tu resumen</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
            {filas.map(([etiqueta, valor], i) => (
              <div key={etiqueta} className={i === 0 ? "col-span-2 border-b border-navy/5 pb-3" : ""}>
                <dt className="text-xs text-navy/50">{etiqueta}</dt>
                <dd className={`mt-0.5 font-semibold ${i === 0 ? "text-lg leading-snug" : ""}`}>{valor}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-ice/70 p-3 text-xs text-navy/70">
            <IconShield className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
            {recomendacion.aviso}
          </p>
        </div>
      </Aparece>
      <Aparece retraso={300}>
        <div className="mx-auto mt-5 flex w-full max-w-xl flex-col gap-3">
          <Link
            to="/oferta"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-mint px-6 py-3 font-medium text-navy transition-colors hover:bg-white"
          >
            Ver dónde estudiar y becas
            <IconArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                alVerDetalle();
              }}
              className="flex-1 rounded-full border border-white/40 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Ver detalle y calificar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                alRepetir();
              }}
              className="flex-1 rounded-full border border-white/40 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Volver a verlo
            </button>
          </div>
        </div>
      </Aparece>
    </div>
  );
}

// ------------------------------- Contenedor -------------------------------

export default function HistoriasResultado({ recomendacion, dimensiones, respuestas, carreras, becas, nombre, onCerrar }) {
  const notas = respuestas?.notas ?? [];
  const mejorMateria = notas.length ? [...notas].sort((a, b) => b.nota - a.nota)[0] : null;
  const dominantes = dimensiones.filter((d) => d.es_dominante);
  const dominante = dominantes.map((d) => DIMENSIONES[d.dimension]?.nombre ?? d.dimension).join(" y ");
  const [indice, setIndice] = useState(0);

  // Solo se muestran las pantallas que tienen datos.
  const pantallas = [
    { id: "intro", fondo: "bg-linear-to-br from-navy to-teal", oscura: true, contenido: <PantallaIntro nombre={nombre} /> },
    notas.length > 0 && {
      id: "materias",
      fondo: "bg-linear-to-br from-teal to-navy",
      oscura: true,
      contenido: <PantallaMaterias notas={notas} />,
    },
    respuestas?.puntaje_global_icfes != null && {
      id: "global",
      fondo: "bg-linear-to-br from-mint to-cyan-light",
      oscura: false,
      contenido: (
        <PantallaGlobal
          puntaje={respuestas.puntaje_global_icfes}
          ingles={respuestas.desempeno_ingles}
          esSimulacro={respuestas.es_simulacro}
        />
      ),
    },
    dimensiones.length > 0 && {
      id: "intereses",
      fondo: "bg-linear-to-br from-navy via-navy to-teal",
      oscura: true,
      contenido: <PantallaIntereses dimensiones={dimensiones} />,
    },
    {
      id: "razones",
      fondo: "bg-linear-to-br from-teal via-teal to-navy",
      oscura: true,
      contenido: <PantallaRazones razones={recomendacion.razones ?? []} explicacion={recomendacion.explicacion} />,
    },
    {
      id: "revelacion",
      fondo: "bg-linear-to-br from-mint via-cyan-light to-white",
      oscura: false,
      contenido: <PantallaRevelacion area={recomendacion.area} nivel={recomendacion.nivel_formacion} />,
    },
    {
      id: "oferta",
      fondo: "bg-linear-to-br from-navy to-teal",
      oscura: true,
      contenido: <PantallaOferta carreras={carreras} becas={becas} />,
    },
    {
      id: "resumen",
      fondo: "bg-linear-to-br from-teal to-navy",
      oscura: true,
      contenido: (
        <PantallaResumen
          datos={{ recomendacion, mejorMateria, dominante, puntajeGlobal: respuestas?.puntaje_global_icfes }}
          alVerDetalle={onCerrar}
          alRepetir={() => setIndice(0)}
        />
      ),
    },
  ].filter(Boolean);

  const total = pantallas.length;
  const actual = pantallas[indice];
  const esUltima = indice === total - 1;

  function siguiente() {
    setIndice((i) => Math.min(total - 1, i + 1));
  }
  function anterior() {
    setIndice((i) => Math.max(0, i - 1));
  }

  // Teclado: flechas para moverse, Escape para salir.
  useEffect(() => {
    function alPresionar(e) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setIndice((i) => Math.min(total - 1, i + 1));
      } else if (e.key === "ArrowLeft") {
        setIndice((i) => Math.max(0, i - 1));
      } else if (e.key === "Escape") {
        onCerrar();
      }
    }
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [total, onCerrar]);

  // Mientras se ven las historias, la página de atrás no se mueve.
  useEffect(() => {
    const anteriorOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anteriorOverflow;
    };
  }, []);

  // Clic en el tercio izquierdo: atrás. En el resto: adelante.
  function alHacerClic(e) {
    if (esUltima) return;
    const caja = e.currentTarget.getBoundingClientRect();
    if (e.clientX - caja.left < caja.width / 3) anterior();
    else siguiente();
  }

  const colorTexto = actual.oscura ? "text-white" : "text-navy";
  const pista = actual.oscura ? "bg-white/25" : "bg-navy/20";
  const relleno = actual.oscura ? "bg-white" : "bg-navy";
  const borde = actual.oscura ? "border-white/40" : "border-navy/30";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tu resultado, paso a paso"
      className={`fixed inset-0 z-50 flex flex-col transition-colors duration-700 ${actual.fondo} ${colorTexto}`}
    >
      {/* Barritas de progreso y controles */}
      <div className="mx-auto w-full max-w-3xl px-5 pt-5 sm:px-8">
        <div className="flex gap-1.5">
          {pantallas.map((p, i) => (
            <div key={p.id} className={`h-1 flex-1 overflow-hidden rounded-full ${pista}`}>
              <div
                className={`h-full rounded-full ${relleno} transition-[width] duration-500`}
                style={{ width: i <= indice ? "100%" : "0%" }}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="opacity-70">
            {indice + 1} de {total}
          </span>
          <div className="flex items-center gap-4">
            {!esUltima && (
              <button type="button" onClick={() => setIndice(total - 1)} className="font-medium opacity-80 hover:opacity-100">
                Saltar al resumen
              </button>
            )}
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg opacity-80 hover:bg-black/10 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* Pantalla actual: `key` hace que sus animaciones vuelvan a empezar */}
      <div
        className={`mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-5 pb-8 sm:px-8 ${esUltima ? "" : "cursor-pointer select-none"}`}
        onClick={alHacerClic}
      >
        <div key={actual.id} className="h-full">
          {actual.contenido}
        </div>
      </div>

      {/* Flechas visibles (además del clic en la pantalla) */}
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 pb-6 sm:px-8">
        <button
          type="button"
          onClick={anterior}
          disabled={indice === 0}
          aria-label="Anterior"
          className={`flex h-11 w-11 items-center justify-center rounded-full border opacity-80 hover:opacity-100 disabled:invisible ${borde}`}
        >
          <IconArrowRight className="h-4 w-4 rotate-180" />
        </button>
        {!esUltima && (
          <button
            type="button"
            onClick={siguiente}
            aria-label="Siguiente"
            className={`flex h-11 w-11 items-center justify-center rounded-full border opacity-80 hover:opacity-100 ${borde}`}
          >
            <IconArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
