import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Navbar from "../../components/Navbar";
import ProgressBar from "../../components/ProgressBar";
import { IconSparkles } from "../../components/icons";
import { mensajeDeError } from "../../services/api";
import { obtenerEstadoAutorizacion } from "../../services/consentimientoService";
import {
  guardarAcademico,
  guardarPsicometrico,
  guardarSociodemografico,
  guardarSocioeconomico,
  obtenerInstrumentoActivo,
} from "../../services/cuestionarioService";
import PasoAcademico, { AREAS_ACADEMICAS } from "./PasoAcademico";
import PasoPsicometrico from "./PasoPsicometrico";
import PasoSocioeconomico from "./PasoSocioeconomico";
import PasoSociodemografico from "./PasoSociodemografico";

const TOTAL_PASOS = 4;

export default function Cuestionario() {
  const navigate = useNavigate();

  const [verificando, setVerificando] = useState(true);
  const [paso, setPaso] = useState(1);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [completado, setCompletado] = useState(false);

  const [academico, setAcademico] = useState({});
  const [socio, setSocio] = useState({});
  const [economico, setEconomico] = useState({});
  const [preguntas, setPreguntas] = useState([]);
  const [cargandoPreguntas, setCargandoPreguntas] = useState(false);
  const [respuestas, setRespuestas] = useState({});

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
    if (paso === 4 && preguntas.length === 0) {
      setCargandoPreguntas(true);
      obtenerInstrumentoActivo()
        .then((data) => setPreguntas(data.preguntas))
        .catch((err) => setError(mensajeDeError(err)))
        .finally(() => setCargandoPreguntas(false));
    }
  }, [paso, preguntas.length]);

  async function manejarSiguiente() {
    setError("");
    setGuardando(true);
    try {
      if (paso === 1) {
        const notas = AREAS_ACADEMICAS.map((area) => ({
          area,
          nota: Number(academico[area]),
        }));
        if (notas.some((n) => !n.nota || n.nota < 1 || n.nota > 5)) {
          throw { response: { status: 400, data: {} } };
        }
        await guardarAcademico(notas);
      } else if (paso === 2) {
        await guardarSociodemografico({
          edad: Number(socio.edad),
          genero: socio.genero || null,
          zona: socio.zona,
          tipo_institucion: socio.tipo_institucion,
        });
      } else if (paso === 3) {
        await guardarSocioeconomico({
          estrato: economico.estrato ? Number(economico.estrato) : null,
          rango_ingresos: economico.rango_ingresos || null,
          personas_hogar: economico.personas_hogar ? Number(economico.personas_hogar) : null,
          educacion_madre: economico.educacion_madre || null,
          educacion_padre: economico.educacion_padre || null,
          ocupacion_hogar: economico.ocupacion_hogar || null,
          tiene_internet: economico.tiene_internet ?? null,
          tiene_computador: economico.tiene_computador ?? null,
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
      setCompletado(true);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  }

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ice">
        <p className="text-sm text-navy/60">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ice">
      <Navbar />
      <main className="mx-auto max-w-xl px-6 py-12">
        <div className="rounded-3xl border border-navy/5 bg-white p-8 shadow-xl shadow-teal/10">
          {completado ? (
            <div className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-mint/40 text-teal">
                <IconSparkles className="h-5.5 w-5.5" />
              </span>
              <h1 className="mt-4 text-lg font-semibold text-navy">
                ¡Completaste el cuestionario!
              </h1>
              <p className="mt-2 text-sm text-navy/60">
                Tu recomendación vocacional estará disponible muy pronto. Esta
                herramienta es orientativa y no reemplaza el acompañamiento de
                tu orientador escolar.
              </p>
              <Link to="/panel">
                <Button variant="primary" className="mt-6 w-full">
                  Volver a mi panel
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <ProgressBar paso={paso} total={TOTAL_PASOS} />

              <h1 className="mt-5 text-lg font-semibold text-navy">
                {paso === 1 && "Datos académicos"}
                {paso === 2 && "Datos sociodemográficos"}
                {paso === 3 && "Datos socioeconómicos"}
                {paso === 4 && "Test de intereses"}
              </h1>

              <div className="mt-5">
                <Alert tipo="error">{error}</Alert>
              </div>

              <div className="mt-4">
                {paso === 1 && (
                  <PasoAcademico
                    valores={academico}
                    onChange={(area, valor) => setAcademico((p) => ({ ...p, [area]: valor }))}
                  />
                )}
                {paso === 2 && (
                  <PasoSociodemografico
                    valores={socio}
                    onChange={(campo, valor) => setSocio((p) => ({ ...p, [campo]: valor }))}
                  />
                )}
                {paso === 3 && (
                  <PasoSocioeconomico
                    valores={economico}
                    onChange={(campo, valor) => setEconomico((p) => ({ ...p, [campo]: valor }))}
                  />
                )}
                {paso === 4 && (
                  <PasoPsicometrico
                    preguntas={preguntas}
                    respuestas={respuestas}
                    cargando={cargandoPreguntas}
                    onChange={(preguntaId, valor) =>
                      setRespuestas((p) => ({ ...p, [preguntaId]: valor }))
                    }
                  />
                )}
              </div>

              <div className="mt-6 flex gap-3">
                {paso > 1 && (
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setPaso((p) => p - 1)}
                    disabled={guardando}
                  >
                    Anterior
                  </Button>
                )}
                {paso < 4 ? (
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={manejarSiguiente}
                    disabled={guardando}
                  >
                    {guardando ? "Guardando..." : "Siguiente"}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={manejarFinalizar}
                    disabled={guardando || cargandoPreguntas}
                  >
                    {guardando ? "Guardando..." : "Ver mi resultado"}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
