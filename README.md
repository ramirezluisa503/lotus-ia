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

## Cómo correr el proyecto localmente

Requisitos: Docker Desktop, Python 3.13, Node.js 20+.

### 1. Clonar y entrar al repositorio

```bash
git clone https://github.com/ramirezluisa503/lotus-ia.git
cd lotus-ia
```

### 2. Base de datos (PostgreSQL con Docker)

```bash
docker compose up -d
```

Esto crea el contenedor `lotusia_db` y aplica `backend/db/schema.sql` automáticamente
la primera vez (si la base de datos ya existía de antes, corre también los
`backend/db/migration_*.sql` pendientes a mano).

Para tener datos de ejemplo (instituciones, carreras, becas, el test psicométrico
y el modelo de IA activo), corre también los archivos `backend/db/seed_*.sql` —
no se aplican solos, hay que correrlos a mano una vez:

```bash
cat backend/db/seed_instrumento_demo.sql | docker exec -i lotusia_db psql -U lotusia -d lotusia
cat backend/db/seed_modelo_placeholder.sql | docker exec -i lotusia_db psql -U lotusia -d lotusia
cat backend/db/seed_oferta_demo.sql | docker exec -i lotusia_db psql -U lotusia -d lotusia
cat backend/db/seed_oferta_virtual.sql | docker exec -i lotusia_db psql -U lotusia -d lotusia
```

### 3. Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows (PowerShell/CMD)
# source .venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

Copia `backend/.env.example` como `backend/.env` y genera tus propios valores
(cada persona usa los suyos, no se comparten ni se suben al repo):

```bash
# Genera un FERNET_KEY:
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Genera un JWT_SECRET (puede ser cualquier texto largo y aleatorio):
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Luego corre el servidor:

```bash
python -m uvicorn app.main:app --port 8000 --reload
```

La API queda en http://localhost:8000/api. Para crear un usuario administrador
(no hay registro público para ese rol):

```bash
python scripts/crear_admin.py --correo admin@lotusia.com --contrasena "TuClave123" --nombre "Admin"
```

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Luego abre http://localhost:5173
