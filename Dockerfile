# Etapa 1: Construcción de la aplicación
FROM node:16-alpine AS build
WORKDIR /app

# Copiar los archivos de configuración de npm
COPY package*.json ./

# Instalar las dependencias
RUN npm ci

# Convertir line endings con sed (opción alternativa a dos2unix)
RUN find . -type f -exec sed -i 's/\r$//' {} +

# Copiar todo el proyecto
COPY . .

# Ejecutar el build de producción
RUN npm run build

# Etapa 2: Servir la aplicación con nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
