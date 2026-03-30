# =====================================================
# RapiCréditos - Dockerfile para EasyPanel
# Estructura: raíz = frontend (Vite), backend/ = Express
# =====================================================

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Variables de build del frontend
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# --- Stage 2: Build Backend ---
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ .
RUN npx tsc || true

# --- Stage 3: Production ---
FROM node:20-alpine
WORKDIR /app

# Copiar backend compilado
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules

# Copiar frontend compilado como archivos estáticos
COPY --from=frontend-builder /app/dist ./public

# Directorio para sesiones WhatsApp
RUN mkdir -p sessions && chown -R node:node /app

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

USER node

CMD ["node", "dist/index.js"]
