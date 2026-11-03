import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.token_confirmacion import TokenConfirmacion


class TokenConfirmacionRepository:
    def __init__(self, db: Session):
        self.db = db

    def crear(self, usuario_id: uuid.UUID, token_hash: str, expira_en: datetime) -> TokenConfirmacion:
        token = TokenConfirmacion(usuario_id=usuario_id, token_hash=token_hash, expira_en=expira_en)
        self.db.add(token)
        return token

    def obtener_vigente(self, token_hash: str) -> TokenConfirmacion | None:
        return (
            self.db.query(TokenConfirmacion)
            .filter(TokenConfirmacion.token_hash == token_hash, TokenConfirmacion.usado.is_(False))
            .first()
        )
