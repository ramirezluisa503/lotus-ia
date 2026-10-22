import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import DatosInsuficientesError, ModeloNoDisponibleError
from app.ia import modelo as capa_ia
from app.models.recomendacion import Recomendacion
from app.repositories.estudiante_repository import EstudianteRepository
from app.repositories.oferta_repository import OfertaRepository
from app.repositories.recomendacion_repository import RecomendacionRepository
from app.schemas.recomendacion import RecomendacionResponse
from app.services.notificacion_service import crear_notificacion

# Traduce nuestros valores guardados en BD (sin tildes, estilo ENUM) a los
# valores "crudos" exactos que espera app/ia/modelo.py (los mismos con que
# se entrenó el árbol -- ver backend/ml/preprocesamiento_v1.json).
_ZONA = {"URBANA": "URBANO", "RURAL": "RURAL"}
_TIPO_INSTITUCION = {"PUBLICA": "OFICIAL", "PRIVADA": "NO OFICIAL"}
_COLE_CARACTER = {
    "ACADEMICO": "ACADÉMICO",
    "TECNICO": "TÉCNICO",
    "TECNICO_ACADEMICO": "TÉCNICO/ACADÉMICO",
    "NO_APLICA": "NO APLICA",
}
_COLE_JORNADA = {
    "MANANA": "MAÑANA", "TARDE": "TARDE", "NOCHE": "NOCHE",
    "COMPLETA": "COMPLETA", "SABATINA": "SABATINA", "UNICA": "UNICA",
}
_GENERO = {"MASCULINO": "M", "FEMENINO": "F"}  # OTRO/PREFIERE_NO_DECIR -> None (mediana)
_SI_NO = {True: "Si", False: "No"}

AREA_ACADEMICA_A_MODELO = {
    "Matemáticas": "punt_matematicas",
    "Lectura crítica": "punt_lectura_critica",
    "Ciencias naturales": "punt_c_naturales",
    "Sociales y ciudadanas": "punt_sociales_ciudadanas",
    "Inglés": "punt_ingles",
}


class RecomendacionService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = RecomendacionRepository(db)
        self.ofertas = OfertaRepository(db)
        self.estudiantes = EstudianteRepository(db)

    def _armar_variables(self, estudiante_id: uuid.UUID) -> dict | None:
        """Arma el diccionario que espera capa_ia.predecir(). Devuelve None
        si todavía falta información obligatoria del cuestionario."""
        estudiante = self.repo.obtener_estudiante(estudiante_id)
        socioeconomico = self.repo.obtener_datos_socioeconomicos(estudiante_id)
        notas = self.repo.notas_por_area(estudiante_id)

        if (
            estudiante is None
            or socioeconomico is None
            or not notas
            or estudiante.puntaje_global_icfes is None
            or estudiante.desempeno_ingles is None
            or estudiante.cole_caracter is None
            or estudiante.cole_jornada is None
        ):
            return None

        puntajes = {
            AREA_ACADEMICA_A_MODELO[nombre]: nota
            for nombre, nota in notas.items()
            if nombre in AREA_ACADEMICA_A_MODELO
        }

        return {
            "estu_genero": _GENERO.get(estudiante.genero),
            "edad": estudiante.edad,
            "cole_area_ubicacion": _ZONA.get(estudiante.zona),
            "cole_naturaleza": _TIPO_INSTITUCION.get(estudiante.tipo_institucion),
            "cole_caracter": _COLE_CARACTER.get(estudiante.cole_caracter),
            "cole_jornada": _COLE_JORNADA.get(estudiante.cole_jornada),
            "cole_depto_ubicacion": "RISARALDA",  # alcance del proyecto: solo Pereira/Risaralda
            "fami_estratovivienda": socioeconomico.estrato,
            "fami_personashogar": socioeconomico.personas_hogar,
            "fami_tieneinternet": _SI_NO.get(socioeconomico.tiene_internet),
            "fami_tienecomputador": _SI_NO.get(socioeconomico.tiene_computador),
            "fami_tienelavadora": _SI_NO.get(socioeconomico.tiene_lavadora),
            "fami_tieneautomovil": _SI_NO.get(socioeconomico.tiene_automovil),
            "fami_educacionpadre": socioeconomico.educacion_padre,
            "fami_educacionmadre": socioeconomico.educacion_madre,
            "punt_global": estudiante.puntaje_global_icfes,
            "desemp_ingles": estudiante.desempeno_ingles,
            **puntajes,
        }

    def _a_response(self, r: Recomendacion) -> RecomendacionResponse:
        return RecomendacionResponse(
            id=r.id,
            area=r.area.nombre,
            nivel_formacion=r.nivel_formacion,
            probabilidad=float(r.probabilidad) if r.probabilidad is not None else None,
            explicacion=r.explicacion,
            generada_en=r.generada_en,
            ya_calificada=self.repo.tiene_encuesta(r.id),
        )

    def generar(self, estudiante_id: uuid.UUID) -> RecomendacionResponse:
        variables = self._armar_variables(estudiante_id)
        if variables is None:
            raise DatosInsuficientesError()

        modelo_activo = self.repo.obtener_modelo_activo()
        if modelo_activo is None:
            raise ModeloNoDisponibleError()

        prediccion = capa_ia.predecir(variables)

        area = self.ofertas.obtener_area_por_nombre(prediccion.area_nombre)

        estudiante = self.repo.obtener_estudiante(estudiante_id)
        explicacion = prediccion.explicacion
        if estudiante.es_puntaje_simulacro:
            explicacion += (
                " Esta recomendación se calculó con tu puntaje de simulacro o "
                "pre-ICFES, no con el resultado oficial del ICFES Saber 11, así "
                "que podría cambiar cuando ingreses tu puntaje real."
            )

        recomendacion = Recomendacion(
            estudiante_id=estudiante_id,
            modelo_id=modelo_activo.id,
            area_id=area.id,
            nivel_formacion=prediccion.nivel_formacion,
            probabilidad=prediccion.probabilidad,
            explicacion=explicacion,
        )
        guardada = self.repo.guardar(recomendacion)

        if estudiante.estado_proceso in ("REGISTRADO", "AUTORIZADO", "DATOS_COMPLETOS"):
            estudiante.estado_proceso = "RECOMENDADO"

        usuario_id = self.estudiantes.obtener_usuario_id_de_estudiante(estudiante_id)
        if usuario_id is not None:
            crear_notificacion(
                self.db,
                usuario_id,
                "RECOMENDACION_LISTA",
                "Ya tienes tu recomendación vocacional lista.",
                "/resultado",
            )

        self.db.commit()
        return self._a_response(guardada)

    def historial(self, estudiante_id: uuid.UUID) -> list[RecomendacionResponse]:
        return [self._a_response(r) for r in self.repo.listar_historial(estudiante_id)]
