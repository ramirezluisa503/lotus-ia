from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers.auth_controller import router as auth_router
from app.controllers.consentimiento_controller import router as consentimiento_router
from app.controllers.cuestionario_controller import (
    cuestionario_router,
    instrumentos_router,
)
from app.controllers.encuesta_controller import router as encuesta_router
from app.controllers.oferta_controller import router as oferta_router
from app.controllers.recomendacion_controller import router as recomendacion_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title="Lotus.IA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(consentimiento_router, prefix="/api")
app.include_router(cuestionario_router, prefix="/api")
app.include_router(instrumentos_router, prefix="/api")
app.include_router(oferta_router, prefix="/api")
app.include_router(recomendacion_router, prefix="/api")
app.include_router(encuesta_router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
