import uuid

from sqlalchemy.orm import Session

from app.core.exceptions import EstudianteNoVinculadoError
from app.models.consentimiento import Consentimiento
from app.repositories.consentimiento_repository import ConsentimientoRepository
from app.repositories.estudiante_repository import EstudianteRepository
from app.repositories.vinculo_acudiente_repository import VinculoAcudienteRepository
from app.schemas.consentimiento import EstadoConsentimientoResponse
from app.services.notificacion_service import crear_notificacion

VERSION_TEXTO_VIGENTE = "1.0"


class ConsentimientoService:
    def __init__(self, db: Session):
        self.db = db
        self.consentimientos = ConsentimientoRepository(db)
        self.estudiantes = EstudianteRepository(db)
        self.vinculos = VinculoAcudienteRepository(db)

    def _guardar_decision(
        self, estudiante_id: uuid.UUID, tipo: str, aceptado: bool, acudiente_id: uuid.UUID | None
    ) -> Consentimiento:
        existente = self.consentimientos.obtener_vigente(estudiante_id, tipo, VERSION_TEXTO_VIGENTE)
        if existente:
            existente.aceptado = aceptado
            existente.revocado_en = None if aceptado else existente.revocado_en
            return self.consentimientos.guardar(existente)

        nuevo = Consentimiento(
            estudiante_id=estudiante_id,
            tipo=tipo,
            acudiente_id=acudiente_id,
            version_texto=VERSION_TEXTO_VIGENTE,
            aceptado=aceptado,
        )
        return self.consentimientos.guardar(nuevo)

    def otorgar_consentimiento_acudiente(
        self, acudiente_usuario_id: uuid.UUID, aceptado: bool
    ) -> Consentimiento:
        estudiante_usuario_id = self.vinculos.obtener_estudiante_vinculado(acudiente_usuario_id)
        if estudiante_usuario_id is None:
            raise EstudianteNoVinculadoError()
        estudiante_id = self.estudiantes.obtener_estudiante_id_de_usuario(estudiante_usuario_id)

        resultado = self._guardar_decision(
            estudiante_id, "CONSENTIMIENTO", aceptado, acudiente_id=acudiente_usuario_id
        )

        mensaje = (
            "Tu acudiente autorizó tu participación en Lotus.IA."
            if aceptado
            else "Tu acudiente no autorizó tu participación por ahora."
        )
        crear_notificacion(
            self.db, estudiante_usuario_id, "ACUDIENTE_CONSENTIMIENTO", mensaje, "/autorizacion"
        )

        estado = self.obtener_estado(estudiante_usuario_id)
        if estado.puede_continuar:
            estudiante = self.estudiantes.obtener_por_id(estudiante_id)
            if estudiante.estado_proceso == "REGISTRADO":
                estudiante.estado_proceso = "AUTORIZADO"

        self.db.commit()
        return resultado

    def otorgar_asentimiento_estudiante(
        self, estudiante_usuario_id: uuid.UUID, aceptado: bool
    ) -> Consentimiento:
        estudiante_id = self.estudiantes.obtener_estudiante_id_de_usuario(estudiante_usuario_id)
        resultado = self._guardar_decision(estudiante_id, "ASENTIMIENTO", aceptado, acudiente_id=None)

        estado = self.obtener_estado(estudiante_usuario_id)
        if estado.puede_continuar:
            estudiante = self.estudiantes.obtener_por_id(estudiante_id)
            if estudiante.estado_proceso == "REGISTRADO":
                estudiante.estado_proceso = "AUTORIZADO"
                self.db.commit()

        return resultado

    def obtener_estado_para_acudiente(self, acudiente_usuario_id: uuid.UUID) -> EstadoConsentimientoResponse:
        estudiante_usuario_id = self.vinculos.obtener_estudiante_vinculado(acudiente_usuario_id)
        if estudiante_usuario_id is None:
            raise EstudianteNoVinculadoError()
        return self.obtener_estado(estudiante_usuario_id)

    def obtener_estado(self, estudiante_usuario_id: uuid.UUID) -> EstadoConsentimientoResponse:
        estudiante_id = self.estudiantes.obtener_estudiante_id_de_usuario(estudiante_usuario_id)

        consentimiento = self.consentimientos.obtener_vigente(
            estudiante_id, "CONSENTIMIENTO", VERSION_TEXTO_VIGENTE
        )
        asentimiento = self.consentimientos.obtener_vigente(
            estudiante_id, "ASENTIMIENTO", VERSION_TEXTO_VIGENTE
        )

        consentimiento_otorgado = bool(consentimiento and consentimiento.aceptado)
        asentimiento_otorgado = bool(asentimiento and asentimiento.aceptado)

        return EstadoConsentimientoResponse(
            consentimiento_otorgado=consentimiento_otorgado,
            asentimiento_otorgado=asentimiento_otorgado,
            puede_continuar=consentimiento_otorgado and asentimiento_otorgado,
        )
