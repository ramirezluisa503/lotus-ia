# Despliegue en AWS (capa gratuita)

Toda la app corre en **una sola máquina EC2** con Docker:

```
Internet ──HTTPS──> [ web: Caddy ] ──/api──> [ backend: FastAPI + modelo ] ──> [ db: PostgreSQL ]
                        └── sirve el frontend compilado (React)
```

- `docker-compose.prod.yml` levanta los tres servicios.
- Caddy saca el certificado HTTPS gratis (Let's Encrypt). Como no hay dominio
  propio se usa **sslip.io**: `3-15-20-40.sslip.io` apunta a la IP `3.15.20.40`.
- La primera vez la base de datos se crea sola con `schema.sql` y los `seed_*.sql`.
- Solo quedan abiertos los puertos 80/443 (web) y 22 (SSH). La base de datos y
  el backend no se exponen a internet.

---

## 0. Antes de empezar: evitar cobros

1. En la consola: **Facturación y administración de costos → Presupuestos → Crear un presupuesto →
   "Presupuesto de gasto cero"** con tu correo. Te avisa si algo empieza a cobrar.
2. En **Facturación → Capa gratuita** (o "Plan") revisa qué tipo de cuenta tienes:
   - Cuentas creadas **antes del 15 de julio de 2025**: 12 meses con 750 h/mes de EC2 micro gratis.
   - Cuentas creadas **después**: plan gratuito con créditos (USD 100–200) que duran 6 meses.
   En ambos casos esta guía cabe dentro de lo gratuito si tienes **una sola instancia**.

Trabaja siempre en la misma región (arriba a la derecha). Esta guía usa **EE. UU. Este (Ohio) — us-east-2**.

## 1. Crear la máquina (instancia EC2)

**EC2 → Instancias → Lanzar instancias**

| Campo | Valor |
|---|---|
| Nombre | `lotusia` |
| Imagen (AMI) | **Ubuntu Server 24.04 LTS** (la que dice "Apta para la capa gratuita") |
| Tipo de instancia | **t3.micro** (o la micro que diga "Apta para la capa gratuita") |
| Par de claves | **Crear un nuevo par de claves** → nombre `lotusia-clave`, RSA, `.pem`. Guarda el archivo, no se puede volver a descargar |
| Configuración de red → Firewall | **Crear grupo de seguridad** y marca las 3 casillas: SSH desde **Cualquier lugar**, **HTTPS** y **HTTP** desde internet |
| Almacenamiento | **25 GiB gp3** (la capa gratuita cubre hasta 30) |

Clic en **Lanzar instancia**.

> SSH desde "cualquier lugar" es necesario para conectarse desde el navegador
> (paso 3). Ubuntu en AWS solo acepta entrar con llave, no con contraseña.

## 2. IP fija (IP elástica)

Sin esto la IP cambia cada vez que se apaga la máquina y el certificado HTTPS deja de servir.

1. **EC2 → Red y seguridad → Direcciones IP elásticas → Asignar la dirección IP elástica → Asignar**.
2. Selecciónala → **Acciones → Asociar la dirección IP elástica** → elige la instancia `lotusia` → **Asociar**.
3. Anota la IP, por ejemplo `3.15.20.40`. Tu dirección será la IP con guiones + `.sslip.io`:
   **`3-15-20-40.sslip.io`**

> Si algún día borras la instancia, **libera** también la IP elástica
> (Acciones → Liberar), porque una IP sin usar cobra.

## 3. Entrar a la máquina

**EC2 → Instancias →** selecciona `lotusia` **→ Conectar → pestaña "EC2 Instance Connect" → Conectar**.
Se abre una terminal en el navegador. Todos los comandos que siguen se pegan ahí
(clic derecho → pegar, o Ctrl+Shift+V).

## 4. Preparar el servidor (una sola vez)

Memoria extra (swap) para que compilar no se quede sin RAM:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

Instalar Docker:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
exit
```

El `exit` cierra la terminal: vuelve a **Conectar** (paso 3) para que tome el permiso de Docker.

## 5. Descargar el proyecto y configurar

```bash
git clone https://github.com/ramirezluisa503/lotus-ia.git
cd lotus-ia
cp .env.produccion.example .env
```

Genera los secretos (copia cada resultado):

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"   # para POSTGRES_PASSWORD
python3 -c "import secrets; print(secrets.token_urlsafe(32))"   # para JWT_SECRET
python3 -c "import base64, os; print(base64.urlsafe_b64encode(os.urandom(32)).decode())"   # para FERNET_KEY
```

Abre el archivo y llena los valores:

```bash
nano .env
```

```
DOMINIO=3-15-20-40.sslip.io
POSTGRES_PASSWORD=<el primero>
JWT_SECRET=<el segundo>
FERNET_KEY=<el tercero>
```

Los de correo (`SMTP_*`) son opcionales; son los mismos de tu `backend/.env` local.
Guarda con **Ctrl+O, Enter** y sal con **Ctrl+X**.

> Guarda una copia del `FERNET_KEY` en un lugar seguro: con él se cifran los
> nombres de los usuarios. Si se pierde, esos datos no se pueden leer.

## 6. Arrancar

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

La primera vez tarda unos 5–10 minutos (descarga imágenes, instala dependencias y compila el frontend).
Para ver que los tres servicios estén `Up`:

```bash
docker compose -f docker-compose.prod.yml ps
```

## 7. Crear el administrador

```bash
docker compose -f docker-compose.prod.yml exec backend python scripts/crear_admin.py --correo admin@lotusia.com --contrasena "TuClaveSegura123" --nombre "Admin"
```

## 8. Abrir la app

**https://3-15-20-40.sslip.io** (con tu IP). El candado de HTTPS puede tardar
hasta un minuto en aparecer la primera vez.

---

## Actualizar después de nuevos cambios en GitHub

```bash
cd lotus-ia
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Los datos de la base de datos se conservan. Si un cambio trae un
`backend/db/migration_*.sql` nuevo, hay que correrlo a mano:

```bash
cat backend/db/migration_XXX.sql | docker compose -f docker-compose.prod.yml exec -T db psql -U lotusia -d lotusia
```

## Si algo falla

| Síntoma | Qué revisar |
|---|---|
| La página no abre | `docker compose -f docker-compose.prod.yml ps` — los 3 deben estar `Up`. Revisa que el grupo de seguridad tenga 80 y 443 abiertos |
| Error de certificado / HTTPS | `docker compose -f docker-compose.prod.yml logs web` — revisa que `DOMINIO` tenga la IP elástica correcta con guiones |
| Errores al registrarse o al generar la recomendación | `docker compose -f docker-compose.prod.yml logs backend` |
| La compilación se cuelga o dice "Killed" | Falta la swap del paso 4: `free -h` debe mostrar 2 GB en "Swap" |

## Apagar para no gastar

**EC2 → Instancias → Estado de la instancia → Detener**. Los datos se conservan y
al **Iniciar** de nuevo todo arranca solo (los contenedores tienen `restart: unless-stopped`).

Ojo: mientras la máquina está detenida, la IP elástica queda "sin usar" y AWS la
cobra (unos USD 0,12 por día). Para pocas horas no importa; si la vas a dejar
apagada semanas, es más barato dejarla encendida o liberar la IP.
