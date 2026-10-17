import uuid

from sqlalchemy.orm import Session

from app.models.area_academica import AreaAcademica
from app.models.datos_socioeconomicos import DatosSocioeconomicos
from app.models.estudiante import Estudiante
from app.models.instrumento import Instrumento
from app.models.pregunta import Pregunta
from app.models.rendimiento_academico import RendimientoAcademico
from app.models.respuesta import Respuesta


class CuestionarioRepository:
    def __init__(self, db: Session):
        self.db = db

    # ---------- Paso 1: académico ----------

    def obtener_area_por_nombre(self, nombre: str) -> AreaAcademica | None:
        return self.db.query(AreaAcademica).filter(AreaAcademica.nombre == nombre).first()

    def guardar_nota(self, estudiante_id: uuid.UUID, area_id: int, nota: float) -> None:
        existente = self.db.get(RendimientoAcademico, (estudiante_id, area_id))
        if existente:
            existente.nota = nota
        else:
            self.db.add(RendimientoAcademico(estudiante_id=estudiante_id, area_id=area_id, nota=nota))

    # ---------- Paso 2: sociodemográfico ----------

    def obtener_estudiante(self, estudiante_id: uuid.UUID) -> Estudiante | None:
        return self.db.get(Estudiante, estudiante_id)

    # ---------- Paso 3: socioeconómico ----------

    def obtener_datos_socioeconomicos(self, estudiante_id: uuid.UUID) -> DatosSocioeconomicos | None:
        return self.db.get(DatosSocioeconomicos, estudiante_id)

    def guardar_datos_socioeconomicos(self, datos: DatosSocioeconomicos) -> DatosSocioeconomicos:
        existente = self.db.get(DatosSocioeconomicos, datos.estudiante_id)
        if existente:
            for campo in (
                "estrato", "rango_ingresos", "personas_hogar", "educacion_madre",
                "educacion_padre", "ocupacion_hogar", "tiene_internet",
                "tiene_computador", "recibe_apoyo_estatal", "trabaja",
            ):
                setattr(existente, campo, getattr(datos, campo))
            return existente
        self.db.add(datos)
        return datos

    # ---------- Paso 4: test psicométrico ----------

    def obtener_instrumento_activo(self) -> Instrumento | None:
        return self.db.query(Instrumento).filter(Instrumento.activo.is_(True)).first()

    def listar_preguntas(self, instrumento_id: int) -> list[Pregunta]:
        return (
            self.db.query(Pregunta)
            .filter(Pregunta.instrumento_id == instrumento_id)
            .order_by(Pregunta.orden)
            .all()
        )

    def obtener_pregunta(self, pregunta_id: int) -> Pregunta | None:
        return self.db.get(Pregunta, pregunta_id)

    def guardar_respuesta(self, estudiante_id: uuid.UUID, pregunta_id: int, valor: int) -> None:
        existente = self.db.get(Respuesta, (estudiante_id, pregunta_id))
        if existente:
            existente.valor = valor
        else:
            self.db.add(Respuesta(estudiante_id=estudiante_id, pregunta_id=pregunta_id, valor=valor))

    def contar_respuestas(self, estudiante_id: uuid.UUID, instrumento_id: int) -> int:
        return (
            self.db.query(Respuesta)
            .join(Pregunta, Pregunta.id == Respuesta.pregunta_id)
            .filter(Respuesta.estudiante_id == estudiante_id, Pregunta.instrumento_id == instrumento_id)
            .count()
        )
