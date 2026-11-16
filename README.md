# Lotus.IA

Plataforma web que integra Inteligencia Artificial para la orientación vocacional y
elección de carreras universitarias de estudiantes de grado 10° y 11° en Pereira.

Proyecto de grado — Tecnología en Desarrollo de Software, Universidad Católica de Pereira.
Autoras: Luisa Fernanda Ramírez Osorio, Mariana Rosero Medina.

## Despliegue

La plataforma está publicada en **https://lotus-ia.duckdns.org**

- Servidor: AWS EC2 (capa gratuita), región Ohio (`us-east-2`), una sola instancia
  `t3.micro` con IP elástica `16.59.117.22`.
- Dominio: subdominio gratuito de [DuckDNS](https://www.duckdns.org) que apunta a esa IP.
  Para cambiarlo se actualiza `DOMINIO` en el `.env` del servidor y se corre
  `docker compose -f docker-compose.prod.yml up -d`; Caddy saca el certificado HTTPS solo.
- Corre con `docker-compose.prod.yml`: base de datos (PostgreSQL), backend (FastAPI +
  modelo de IA) y Caddy, que sirve el frontend y saca el certificado HTTPS.
- Publicar cambios nuevos de `main`: entrar al servidor y correr
  `cd lotus-ia && git pull && docker compose -f docker-compose.prod.yml up -d --build`.

Paso a paso completo (crear el servidor, configurarlo y actualizarlo) en
[docs/despliegue-aws.md](docs/despliegue-aws.md). Las claves del servidor y del
administrador no se guardan en el repositorio.

## Estructura del repositorio

```
Lotus.IA/
├── frontend/                   React + Vite + Tailwind CSS (interfaz web)
│   ├── src/
│   │   ├── pages/               Páginas: Home, Login, Registro, Cuestionario, Resultado,
│   │   │                        Oferta, Perfil, Panel, Autorización, admin/ (panel de administración)
│   │   ├── components/          Componentes reutilizables (Navbar, Button, Field, Alert,
│   │   │                        Notificaciones, HistoriasResultado...)
│   │   ├── services/            Llamadas a la API del backend (authService, cuestionarioService,
│   │   │                        ofertaService, recomendacionService...)
│   │   ├── context/              Estado global de sesión (AuthContext)
│   │   └── routes/               Rutas protegidas según el rol del usuario
│   ├── public/img/               Imágenes estáticas
│   └── Dockerfile, Caddyfile     Imagen de producción (Caddy sirve el frontend y hace de proxy HTTPS)
│
├── backend/                    FastAPI + SQLAlchemy + PostgreSQL (API REST)
│   ├── app/
│   │   ├── controllers/          Endpoints HTTP, uno por módulo (auth, cuestionario, oferta,
│   │   │                         consentimiento, recomendacion, admin...)
│   │   ├── services/              Lógica de negocio de cada módulo
│   │   ├── repositories/          Acceso a la base de datos (consultas SQL vía SQLAlchemy)
│   │   ├── models/                  Tablas de la base de datos (SQLAlchemy ORM)
│   │   ├── schemas/                  Validación de datos de entrada/salida (Pydantic)
│   │   ├── core/                     Seguridad (JWT, cifrado, hashing), configuración, email
│   │   ├── ia/                        Carga del modelo entrenado y generación de predicciones
│   │   └── db/                        Conexión y sesión de la base de datos
│   ├── db/                       schema.sql, migraciones (migration_001...008) y datos semilla
│   ├── ml/                       Modelo de IA entrenado (.pkl) + entrenamiento/ (scripts paso a
│   │                             paso: limpieza, codificación, normalización, comparación de modelos)
│   └── scripts/                  Scripts de administración (crear_admin.py)
│
└── docs/                       Documentación del proyecto (análisis, diseño, diagramas, guía de
                                 despliegue en AWS, identidad de marca)
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
- [x] Despliegue en AWS EC2

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

Esto crea el contenedor `lotusia_db` y, la primera vez, aplica automáticamente
`backend/db/schema.sql` y los datos de ejemplo `backend/db/seed_*.sql`
(instituciones, carreras, becas, el test psicométrico y el modelo de IA activo).
Sin los seeds la recomendación falla porque no hay modelo activo.

Si la base de datos ya existía de antes, no se aplica nada solo: corre a mano los
`backend/db/migration_*.sql` pendientes y los seeds que te falten:

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
