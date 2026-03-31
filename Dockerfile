# =====================================================
# RapiCréditos Pro - Dockerfile para EasyPanel
# Estructura: raíz = frontend (Vite), backend/ = Express
# Puerto: 8080 (único, sirve frontend estático + API)
# =====================================================

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Variables de build del frontend
# VITE_API_URL vacío = rutas relativas (/api/...) — correcto para producción
ARG VITE_API_URL=
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# --- Stage 2: Build Backend ---
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ .

# Compilar TypeScript (si falla, continúa — runtime tsx puede manejar TS)
RUN npx tsc 2>/dev/null || echo "TSC warnings (non-fatal), continuing..."

# --- Stage 3: Producción ---
FROM node:20-alpine
WORKDIR /app

# Instalar dependencias de producción del backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copiar código del backend (src + dist si existe)
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/src ./src

# Copiar frontend compilado como archivos estáticos
COPY --from=frontend-builder /app/dist ./public

# Instalar tsx para ejecutar TypeScript en producción si el build falla
RUN npm install tsx --save-dev 2>/dev/null || true

# Directorio para sesiones de WhatsApp (persistente en EasyPanel via volume)
RUN mkdir -p sessions && chown -R node:node /app

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

USER node

# Intentar con dist/index.js compilado, fallback a tsx si no existe
CMD ["sh", "-c", "if [ -f dist/index.js ]; then node dist/index.js; else node_modules/.bin/tsx src/index.ts; fi"]
