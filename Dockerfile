# ===========================================
# 🚀 TuVendedor FRONTEND - Dockerfile con pnpm
# ===========================================

# 1️⃣ Etapa de build
FROM node:22-alpine AS build

WORKDIR /app

# Evita errores de memoria en builds grandes
ENV NODE_OPTIONS=--max-old-space-size=2048

# Habilita pnpm usando Corepack
RUN corepack enable

# Copiamos antes de instalar todos los archivos necesarios para pnpm.
# pnpm-workspace.yaml contiene allowBuilds.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Instala dependencias respetando el lockfile
RUN pnpm install --frozen-lockfile

# Copia el resto del proyecto
COPY . .

# Ejecuta el build de producción con Vite
RUN pnpm vite build

# ===========================================
# 2️⃣ Etapa de runtime (Nginx)
# ===========================================
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]