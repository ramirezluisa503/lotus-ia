from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.controllers.auth_controller import router as auth_router
from app.controllers.consentimiento_controller import router as consentimiento_router
from app.controllers.cuestionario_controller import (
    cuestionario_router,
    instrumentos_router,
)
from app.controllers.admin_controller import router as admin_router
from app.controllers.encuesta_controller import router as encuesta_router
from app.controllers.notificacion_controller import router as notificacion_router
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
app.include_router(admin_router, prefix="/api")
app.include_router(notificacion_router, prefix="/api")


_PREFIJO_PYDANTIC = "Value error, "


@app.exception_handler(RequestValidationError)
async def manejar_error_validacion(request: Request, exc: RequestValidationError):
    """Pydantic antepone "Value error, " en inglés a cualquier ValueError que
    levantemos en un validador (p. ej. "Debes indicar tu grado..."). Esto
    limpia ese prefijo sin tocar la forma del detalle que ya lee el
    frontend (mensajeDeError espera una lista de objetos con "msg")."""
    errores = jsonable_encoder(exc.errors())
    for error in errores:
        msg = error.get("msg")
        if error.get("type") == "value_error" and isinstance(msg, str) and msg.startswith(_PREFIJO_PYDANTIC):
            error["msg"] = msg[len(_PREFIJO_PYDANTIC):]
    return JSONResponse(status_code=422, content={"detail": errores})


@app.get("/api/health")
def health():
    return {"status": "ok"}
