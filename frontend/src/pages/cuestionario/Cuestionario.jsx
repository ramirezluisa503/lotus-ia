import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Navbar from "../../components/Navbar";
import { mensajeDeError } from "../../services/api";
import { obtenerEstadoAutorizacion } from "../../services/consentimientoService";
import {
  guardarAcademico,
  guardarPsicometrico,
  guardarSociodemografico,
  guardarSocioeconomico,
  obtenerInstrumentoActivo,
} from "../../services/cuestionarioService";
import { generarRecomendacion } from "../../services/recomendacionService";
import PasoAcademico, { AREAS_ACADEMICAS, PasoFuenteIcfes, calcularPuntajeGlobalIcfes } from "./PasoAcademico";
import PasoPsicometrico from "./PasoPsicometrico";
import PasoSocioeconomico from "./PasoSocioeconomico";
import PasoSociodemografico from "./PasoSociodemografico";

const TOTAL_PASOS = 5;
// El test de intereses se muestra de a 6 preguntas para que quepa sin scroll.
const PREGUNTAS_POR_PARTE = 6;

export default function Cuestionario() {
  const navigate = useNavigate();

  const [verificando, setVerificando] = useState(true);
  const [paso, setPaso] = useState(1);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [academico, setAcademico] = useState({});
  const [socio, setSocio] = useState({});
  const [economico, setEconomico] = useState({});
  const [errores, setErrores] = useState({});
  const [preguntas, setPreguntas] = useState([]);
  const [cargandoPreguntas, setCargandoPreguntas] = useState(false);
  const [respuestas, setRespuestas] = useState({});
  const [parteTest, setParteTest] = useState(0);

  useEffect(() => {
    obtenerEstadoAutorizacion()
      .then((estado) => {
        if (!estado.puede_continuar) {
          navigate("/autorizacion", { replace: true });
          return;
        }
        setVerificando(false);
      })
      .catch(() => navigate("/autorizacion", { replace: true }));
  }, [navigate]);

  useEffect(() => {
    if (paso === 5 && preguntas.length === 0) {
      setCargandoPreguntas(true);
      obtenerInstrumentoActivo()
        .then((data) => setPreguntas(data.preguntas))
        .catch((err) => setError(mensajeDeError(err)))
        .finally(() => setCargandoPreguntas(false));
    }
  }, [paso, preguntas.length]);

  function validarPaso1() {
    const err = {};
    AREAS_ACADEMICAS.forEach((area) => {
      const valor = academico[area];
      const n = Number(valor);
      if (valor === undefined || valor === "") err[area] = "Ingresa un número.";
      else if (Number.isNaN(n) || n < 0 || n > 100) err[area] = "Debe estar entre 0 y 100.";
    });
    if (!academico.desempeno_ingles) err.desempeno_ingles = "Selecciona una opción.";
    return err;
  }

  function validarPaso2() {
    const err = {};
    const edad = Number(socio.edad);
    if (socio.edad === undefined || socio.edad === "") err.edad = "Ingresa tu edad.";
    else if (Number.isNaN(edad) || edad <= 10) err.edad = "Debes tener más de 10 años.";
    if (!socio.zona) err.zona = "Selecciona una opción.";
    if (!socio.tipo_institucion) err.tipo_institucion = "Selecciona una opción.";
    if (!socio.cole_caracter) err.cole_caracter = "Selecciona una opción.";
    if (!socio.cole_jornada) err.cole_jornada = "Selecciona una opción.";
    return err;
  }

  function validarPaso3() {
    const err = {};
    if (economico.estrato) {
      const estrato = Number(economico.estrato);
      if (Number.isNaN(estrato) || estrato < 0 || estrato > 6) err.estrato = "Debe estar entre 0 y 6.";
    }
    if (economico.personas_hogar) {
      const personas = Number(economico.personas_hogar);
      if (Number.isNaN(personas) || personas < 1 || personas > 20) {
        err.personas_hogar = "Debe estar entre 1 y 20.";
      }
    }
    return err;
  }

  async function manejarSiguiente() {
    setError("");

    const erroresPaso =
      paso === 2 ? validarPaso1() : paso === 3 ? validarPaso2() : paso === 4 ? validarPaso3() : {};

    if (Object.keys(erroresPaso).length > 0) {
      setErrores(erroresPaso);
      setError("Revisa los campos marcados en rojo.");
      return;
    }
    setErrores({});

    setGuardando(true);
    try {
      if (paso === 2) {
        const notas = AREAS_ACADEMICAS.map((area) => ({
          area,
          nota: Number(academico[area]),
        }));
        await guardarAcademico({
          notas,
          puntaje_global_icfes: calcularPuntajeGlobalIcfes(academico),
          desempeno_ingles: academico.desempeno_ingles,
          es_simulacro: Boolean(academico.es_simulacro),
        });
      } else if (paso === 3) {
        await guardarSociodemografico({
          edad: Number(socio.edad),
          genero: socio.genero || null,
          zona: socio.zona,
          tipo_institucion: socio.tipo_institucion,
          cole_caracter: socio.cole_caracter,
          cole_jornada: socio.cole_jornada,
        });
      } else if (paso === 4) {
        await guardarSocioeconomico({
          estrato: economico.estrato ? Number(economico.estrato) : null,
          rango_ingresos: economico.rango_ingresos || null,
          personas_hogar: economico.personas_hogar ? Number(economico.personas_hogar) : null,
          educacion_madre: economico.educacion_madre || null,
          educacion_padre: economico.educacion_padre || null,
          ocupacion_madre: economico.ocupacion_madre || null,
          ocupacion_padre: economico.ocupacion_padre || null,
          tiene_internet: economico.tiene_internet ?? null,
          tiene_computador: economico.tiene_computador ?? null,
          tiene_lavadora: economico.tiene_lavadora ?? null,
          tiene_automovil: economico.tiene_automovil ?? null,
          recibe_apoyo_estatal: economico.recibe_apoyo_estatal ?? null,
          trabaja: economico.trabaja ?? null,
        });
      }
      setPaso((p) => p + 1);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  const totalPartes = Math.max(1, Math.ceil(preguntas.length / PREGUNTAS_POR_PARTE));
  const preguntasParte = preguntas.slice(
    parteTest * PREGUNTAS_POR_PARTE,
    (parteTest + 1) * PREGUNTAS_POR_PARTE
  );
  const esUltimaParte = parteTest >= totalPartes - 1;

  function siguienteParteTest() {
    if (preguntasParte.some((p) => respuestas[p.id] === undefined)) {
      setError("Responde todas las preguntas antes de continuar.");
      return;
    }
    setError("");
    setParteTest((n) => n + 1);
  }

  async function manejarFinalizar() {
    setError("");
    if (Object.keys(respuestas).length < preguntas.length) {
      setError("Responde todas las preguntas antes de continuar.");
      return;
    }
    setGuardando(true);
    try {
      const payload = Object.entries(respuestas).map(([pregunta_id, valor]) => ({
        pregunta_id: Number(pregunta_id),
        valor,
      }));
      await guardarPsicometrico(payload);
      await generarRecomendacion();
      navigate("/resultado");
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  if (verificando) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-ice">
        <p className="text-sm text-navy/60">Cargando...</p>
      </div>
    );
  }

  return (
    // La página ocupa justo el alto de la pantalla: la tarjeta es ancha y
    // los campos van en columnas para que cada paso quepa sin scroll.
    <div className="flex min-h-svh flex-col bg-ice md:h-svh">
      <Navbar />
      {/* Arriba, no centrado: así el progreso queda quieto aunque la tarjeta
          cambie de alto entre pasos. */}
      <main className="mx-auto flex w-full max-w-5xl min-h-0 flex-1 flex-col px-6 pb-5 pt-6 sm:pt-8">
      {/* Progreso por fuera de la tarjeta, centrado y sin fondo */}
        <ol className="mx-auto mb-5 flex w-full max-w-md items-center">
          {Array.from({ length: TOTAL_PASOS }, (_, i) => {
            const numero = i + 1;
            const alcanzado = numero <= paso;
            return (
              <li key={numero} className={"flex items-center " + (numero < TOTAL_PASOS ? "flex-1" : "")}>
                <span
                  className={
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 " +
                    (alcanzado
                      ? "bg-teal text-white shadow-md shadow-teal/25"
                      : "border border-navy/15 bg-white text-navy/50")
                  }
                >
                  {numero}
                </span>
                {numero < TOTAL_PASOS && (
                  <span
                    className={
                      "mx-1 h-0.5 flex-1 rounded-full transition-colors duration-300 " +
                      (numero < paso ? "bg-teal" : "bg-navy/10")
                    }
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Tarjeta de alto fijo en pantallas medianas: el título queda quieto y
            si un paso trae más campos, se hace scroll solo por dentro. */}
        <div className="flex w-full flex-col rounded-3xl border border-navy/5 bg-white px-6 py-5 shadow-xl shadow-teal/10 sm:px-8 md:h-[22rem] md:min-h-0">
          <h1 className="shrink-0 text-center text-xl font-semibold text-navy">
            {paso === 1 && "Tus resultados del ICFES"}
            {paso === 2 && "Datos académicos"}
            {paso === 3 && "Datos sociodemográficos"}
            {paso === 4 && "Datos socioeconómicos"}
            {paso === 5 &&
              "Test de intereses" + (totalPartes > 1 ? " · parte " + (parteTest + 1) + " de " + totalPartes : "")}
          </h1>

          {/* key: al cambiar de paso el scroll interno vuelve arriba */}
          <div key={paso + "-" + parteTest} className="-mx-2 mt-1 min-h-0 flex-1 overflow-y-auto px-2 pb-1">
            {error && (
              <div className="mt-4">
                <Alert tipo="error">{error}</Alert>
              </div>
            )}

              <div className="mt-4">
                {paso === 1 && (
                  <PasoFuenteIcfes
                    valores={academico}
                    onChange={(campo, valor) => setAcademico((p) => ({ ...p, [campo]: valor }))}
                  />
                )}
                {paso === 2 && (
                  <PasoAcademico
                    valores={academico}
                    errores={errores}
                    onChange={(area, valor) => {
                      setAcademico((p) => ({ ...p, [area]: valor }));
                      setErrores((p) => ({ ...p, [area]: undefined }));
                    }}
                  />
                )}
                {paso === 3 && (
                  <PasoSociodemografico
                    valores={socio}
                    errores={errores}
                    onChange={(campo, valor) => {
                      setSocio((p) => ({ ...p, [campo]: valor }));
                      setErrores((p) => ({ ...p, [campo]: undefined }));
                    }}
                  />
                )}
                {paso === 4 && (
                  <PasoSocioeconomico
                    valores={economico}
                    errores={errores}
                    onChange={(campo, valor) => {
                      setEconomico((p) => ({ ...p, [campo]: valor }));
                      setErrores((p) => ({ ...p, [campo]: undefined }));
                    }}
                  />
                )}
                {paso === 5 && (
                  <PasoPsicometrico
                    preguntas={preguntasParte}
                    desde={parteTest * PREGUNTAS_POR_PARTE}
                    respuestas={respuestas}
                    cargando={cargandoPreguntas}
                    onChange={(preguntaId, valor) =>
                      setRespuestas((p) => ({ ...p, [preguntaId]: valor }))
                    }
                  />
                )}
              </div>
          </div>
        </div>

        {/* Botones fuera de la tarjeta, abajo a la derecha: como la tarjeta
            tiene alto fijo, quedan siempre en el mismo lugar. */}
        <div className="flex justify-end gap-3 pt-6">
            {(paso > 1 || parteTest > 0) && (
              <Button
                variant="secondary"
                className="min-w-36"
                onClick={() => {
                  setErrores({});
                  setError("");
                  if (paso === 5 && parteTest > 0) setParteTest((n) => n - 1);
                  else setPaso((p) => p - 1);
                }}
                disabled={guardando}
              >
                Anterior
              </Button>
            )}
            {paso < 5 ? (
              <Button
                variant="primary"
                className="min-w-36"
                onClick={manejarSiguiente}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Siguiente"}
              </Button>
            ) : !esUltimaParte ? (
              <Button
                variant="primary"
                className="min-w-36"
                onClick={siguienteParteTest}
                disabled={cargandoPreguntas}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="primary"
                className="min-w-36"
                onClick={manejarFinalizar}
                disabled={guardando || cargandoPreguntas}
              >
                {guardando ? "Guardando..." : "Ver mi resultado"}
              </Button>
            )}
          </div>
      </main>
    </div>
  );
}
