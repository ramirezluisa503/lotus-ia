import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import EstudianteNoVinculadoError
from app.core.security import descifrar_texto
from app.models.consentimiento import Consentimiento
from app.repositories.consentimiento_repository import ConsentimientoRepository
from app.repositories.estudiante_repository import EstudianteRepository
from app.repositories.usuario_repository import UsuarioRepository
from app.repositories.vinculo_acudiente_repository import VinculoAcudienteRepository
from app.schemas.consentimiento import (
    AcudienteVinculadoResponse,
    EstadoConsentimientoResponse,
    EstudianteVinculadoResponse,
)
from app.services.notificacion_service import crear_notificacion

VERSION_TEXTO_VIGENTE = "1.0"


class ConsentimientoService:
    def __init__(self, db: Session):
        self.db = db
        self.consentimientos = ConsentimientoRepository(db)
        self.estudiantes = EstudianteRepository(db)
        self.vinculos = VinculoAcudienteRepository(db)
        self.usuarios = UsuarioRepository(db)

    def _guardar_decision(
        self, estudiante_id: uuid.UUID, tipo: str, aceptado: bool, acudiente_id: uuid.UUID | None
    ) -> Consentimiento:
        existente = self.consentimientos.obtener_vigente(estudiante_id, tipo, VERSION_TEXTO_VIGENTE)
        if existente:
            if aceptado:
                existente.revocado_en = None
            elif existente.aceptado:  # antes estaba aceptado y ahora se retira: es una revocación
                existente.revocado_en = datetime.now(timezone.utc)
            existente.aceptado = aceptado
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
        self, acudiente_usuario_id: uuid.UUID, estudiante_usuario_id: uuid.UUID, aceptado: bool
    ) -> Consentimiento:
        if not self.vinculos.existe_vinculo(acudiente_usuario_id, estudiante_usuario_id):
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

    def listar_estudiantes_para_acudiente(
        self, acudiente_usuario_id: uuid.UUID
    ) -> list[EstudianteVinculadoResponse]:
        resultado = []
        for vinculo in self.vinculos.listar_vinculos(acudiente_usuario_id):
            usuario_estudiante = self.usuarios.obtener_por_id(vinculo.estudiante_usuario_id)
            if usuario_estudiante is None:
                continue
            estado = self.obtener_estado(vinculo.estudiante_usuario_id)
            resultado.append(
                EstudianteVinculadoResponse(
                    estudiante_usuario_id=vinculo.estudiante_usuario_id,
                    nombre=descifrar_texto(usuario_estudiante.nombre_cifrado),
                    documento=(
                        descifrar_texto(usuario_estudiante.documento_cifrado)
                        if usuario_estudiante.documento_cifrado
                        else ""
                    ),
                    correo=usuario_estudiante.correo,
                    parentesco=vinculo.parentesco,
                    consentimiento_otorgado=estado.consentimiento_otorgado,
                    asentimiento_otorgado=estado.asentimiento_otorgado,
                    puede_continuar=estado.puede_continuar,
                )
            )
        return resultado

    def listar_acudientes_para_estudiante(
        self, estudiante_usuario_id: uuid.UUID
    ) -> list[AcudienteVinculadoResponse]:
        resultado = []
        for vinculo in self.vinculos.listar_acudientes_de_estudiante(estudiante_usuario_id):
            usuario_acudiente = self.usuarios.obtener_por_id(vinculo.acudiente_id)
            if usuario_acudiente is None:
                continue
            resultado.append(
                AcudienteVinculadoResponse(
                    nombre=descifrar_texto(usuario_acudiente.nombre_cifrado),
                    correo=usuario_acudiente.correo,
                    parentesco=vinculo.parentesco,
                )
            )
        return resultado

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
