# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL:-https://placeholder.supabase.co}
ENV VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:-placeholder}
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

COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/node_modules ./node_modules

COPY --from=frontend-builder /app/frontend/dist ./public

RUN mkdir -p sessions && chown -R node:node sessions

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/index.js"]
