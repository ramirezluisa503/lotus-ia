import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.token_recuperacion import TokenRecuperacion


class TokenRecuperacionRepository:
    def __init__(self, db: Session):
        self.db = db

    def crear(self, usuario_id: uuid.UUID, token_hash: str, expira_en: datetime) -> TokenRecuperacion:
        token = TokenRecuperacion(usuario_id=usuario_id, token_hash=token_hash, expira_en=expira_en)
        self.db.add(token)
        return token

    def obtener_vigente(self, token_hash: str) -> TokenRecuperacion | None:
        return (
            self.db.query(TokenRecuperacion)
            .filter(TokenRecuperacion.token_hash == token_hash, TokenRecuperacion.usado.is_(False))
            .first()
        )
