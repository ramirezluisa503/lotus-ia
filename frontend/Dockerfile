# 1) Compila la app de React a archivos estáticos (dist/)
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# En producción el frontend y la API comparten dominio: Caddy manda /api al backend.
ENV VITE_API_URL=/api
RUN npm run build

# 2) Caddy sirve esos archivos, hace de proxy hacia el backend y saca el
#    certificado HTTPS solo (Let's Encrypt).
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
