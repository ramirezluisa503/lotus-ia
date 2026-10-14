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
├── ml/         Entrenamiento y modelos de Machine Learning (scikit-learn)
└── docs/       Documentación del proyecto (análisis, diseño, diagramas)
```

Arquitectura: N-capas (monolito modular) — ver `docs/` para el detalle de la
Etapa de Análisis y la Etapa de Diseño.

## Estado actual

- [x] Estructura del repositorio
- [x] Frontend inicial (landing page) con la paleta de marca Lotus.IA
- [ ] Backend (FastAPI) y conexión a PostgreSQL
- [ ] Módulo de autenticación y roles
- [ ] Módulo de consentimiento/asentimiento
- [ ] Módulo de cuestionarios
- [ ] Capa de IA y módulo de recomendación
- [ ] Oferta académica, becas y encuesta de satisfacción

## Frontend — cómo correrlo

```bash
cd frontend
npm install
npm run dev
```

Luego abre http://localhost:5173
