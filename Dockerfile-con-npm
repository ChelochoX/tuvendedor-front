# ===========================================
# 🚀 TuVendedor FRONTEND - Dockerfile
# ===========================================

# 1️⃣ Etapa de build
FROM node:18-alpine AS build

WORKDIR /app

# Copia los archivos necesarios para instalar dependencias
COPY package*.json ./

# Evita errores de memoria en builds grandes
ENV NODE_OPTIONS=--max-old-space-size=2048

# Instala dependencias de manera limpia
RUN npm ci

# Copia el resto del proyecto
COPY . .

# Ejecuta el build de producción con Vite
RUN npx vite build

# ===========================================
# 2️⃣ Etapa de runtime (Nginx)
# ===========================================
FROM nginx:alpine

# Limpia cualquier archivo residual del contenedor base
RUN rm -rf /usr/share/nginx/html/*

# Copia el resultado del build al directorio de Nginx
COPY --from=build /app/dist/ /usr/share/nginx/html/

# Copia la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expone el puerto 80
EXPOSE 80

# Inicia Nginx
CMD ["nginx", "-g", "daemon off;"]
