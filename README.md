# Lotus.IA

Plataforma web que integra Inteligencia Artificial para la orientación vocacional y
elección de carreras universitarias de estudiantes de grado 10° y 11° en Pereira.

Proyecto de grado — Tecnología en Desarrollo de Software, Universidad Católica de Pereira.
Autoras: Luisa Fernanda Ramírez Osorio, Mariana Rosero Medina.

## Estructura del repositorio

```
Lotus.IA/
├── frontend/   React + Vite + Tailwind CSS (interfaz web)
├── backend/    FastAPI + SQLAlchemy + PostgreSQL (API REST)
│   └── ml/     Modelo de IA entrenado (Árbol de Decisión) y scripts de entrenamiento
└── docs/       Documentación del proyecto (análisis, diseño, diagramas)
```

Arquitectura: N-capas (monolito modular) — ver `docs/` para el detalle de la
Etapa de Análisis y la Etapa de Diseño.

## Estado actual

- [x] Estructura del repositorio
- [x] Frontend (landing, autenticación, cuestionarios, resultado, oferta, admin) con la paleta de marca Lotus.IA
- [x] Backend (FastAPI) y conexión a PostgreSQL
- [x] Módulo de autenticación y roles
- [x] Módulo de consentimiento/asentimiento
- [x] Módulo de cuestionarios
- [x] Capa de IA y módulo de recomendación (Árbol de Decisión entrenado con ICFES Saber 11 — ver `backend/ml/README.md`)
- [x] Oferta académica, becas y encuesta de satisfacción
- [x] Panel de administración

## Frontend — cómo correrlo

```bash
cd frontend
npm install
npm run dev
```

Luego abre http://localhost:5173
