# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .

ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG VITE_API_URL=/api

ENV VITE_SUPABASE_URL=${SUPABASE_URL:-https://placeholder.supabase.co}
ENV VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY:-placeholder}
ENV VITE_API_URL=/api

RUN npm run build

# --- Stage 2: Build Backend ---
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ .
RUN npx tsc

# --- Stage 3: Production Runner ---
FROM node:20-alpine
WORKDIR /app

# Instalar dependencias necesarias para Chrome/Puppeteer (si se require en futuro)
# RUN apk add --no-cache chromium

# Copiar backend construído
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules

# Copiar frontend construído a la carpeta pública del backend
COPY --from=frontend-builder /app/frontend/dist ./public

# Crear directorio para sesiones de WhatsApp
RUN mkdir -p sessions && chown -R node:node sessions

# Configurar entorno
ENV NODE_ENV=production
# Google Cloud Run inyectará el PORT automáticamente, pero definimos un default
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/index.js"]
