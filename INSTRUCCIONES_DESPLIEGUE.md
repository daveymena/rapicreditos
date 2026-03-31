# ✅ RapiCréditos Pro — Guía de Despliegue en EasyPanel

## Estado: LISTO PARA PRODUCCIÓN

El repositorio está completamente configurado para desplegarse automáticamente desde GitHub en EasyPanel.

---

## 🚀 Pasos para Desplegar en EasyPanel

### 1. Crear el Servicio

En EasyPanel, crea un nuevo servicio de tipo **App** con:
- **Fuente:** GitHub → `daveymena/repicreditosst` → rama `main`
- **Build:** Dockerfile (automático, detecta el `Dockerfile` en la raíz)
- **Puerto:** `8080`

### 2. Configurar Variables de Entorno

En la pestaña **Environment** del servicio, pega exactamente este contenido:

```
DATABASE_URL=postgres://postgres:6715320D@ollama_rapi-credi:5432/posgres-db
JWT_SECRET=rapicredi_jwt_secret_2026_super_secure_key
PORT=8080
NODE_ENV=production
APP_URL=https://ollama-rapicredisas2.ginee6.easypanel.host
OLLAMA_BASE_URL=https://n8n-ollama.ginee6.easypanel.host
OLLAMA_CHAT_MODEL=qwen2.5:0.5b
OPENWEBUI_URL=https://n8n-ollama.ginee6.easypanel.host
AI_PROVIDER=ollama
AI_MODEL=qwen2.5:0.5b
AI_BASE_URL=https://n8n-ollama.ginee6.easypanel.host/api/generate
GROQ_API_KEY=
GROQ_MODEL=llama-3.1-8b-instant
MERCADOPAGO_PUBLIC_KEY=APP_USR-23c2d74a-d01f-473e-a305-0e5999f023bc
MERCADOPAGO_ACCESS_TOKEN=APP_USR-8419296773492182-072623-ec7505166228860ec8b43957c948e7da-2021591453
PAYPAL_CLIENT_ID=BAAtdQwVN8LvIoRstmHZWlo2ndcJBP8dFZdXLc8HJGdYUXstriO6mO0GJMZimkBCdZHotBkulELqeFm_R4
PAYPAL_CLIENT_SECRET=EP5jZdzbUuHva4I8ERnbNYSHQ_BNe0niXQe91Bvf33Kl88nRKY-ivRx0_PGERS72JbjQSiMr63y9lEEL
PAYPAL_MODE=live
PAYPAL_API_URL=https://api-m.paypal.com
```

### 3. Configurar Dominio

- Dominio: `ollama-rapicredisas2.ginee6.easypanel.host`
- Puerto: `8080`
- HTTPS: ✅ habilitado

### 4. Configurar Volumen (Sesiones WhatsApp)

En la pestaña **Mounts**:
- Tipo: Volume
- Nombre: `sessions`
- Ruta en contenedor: `/app/sessions`

> ⚠️ **IMPORTANTE:** Este volumen persiste las sesiones de WhatsApp entre reinicios. Sin él, tendrás que escanear el QR cada vez que la app se reinicie.

### 5. Desplegar

Haz clic en **Deploy** — EasyPanel construirá la imagen Docker y desplegará la app. El proceso toma ~2-3 minutos.

---

## 🗄️ Base de Datos

La base de datos PostgreSQL ya está configurada. Si necesitas recrear el schema:

1. Conéctate a la BD:
   ```
   Host externo: 164.68.122.5:5436
   Usuario: postgres
   Password: 6715320D
   BD: posgres-db
   ```

2. Ejecuta el schema:
   ```sql
   -- Pegarlo en el editor SQL
   ```
   Ver archivo `EJECUTAR_EN_SUPABASE_SQL_EDITOR.sql`

---

## 🔧 Arquitectura del Sistema

```
[Cliente / Navegador]
       ↓ HTTPS
[EasyPanel - Puerto 8080]
       ↓
[Express.js - Node.js]
   ├── /api/auth/*     → Autenticación (JWT)
   ├── /api/clients/*  → Gestión de clientes
   ├── /api/loans/*    → Gestión de préstamos
   ├── /api/payments/* → Pagos y cobros
   ├── /api/whatsapp/* → Bot WhatsApp (Baileys)
   ├── /api/chat       → IA (Ollama / Groq)
   └── /*              → Frontend React (archivos estáticos)
       ↓
[PostgreSQL - puerto interno 5432]
```

---

## ✅ Correcciones Aplicadas (2026-03-30)

1. **Eliminado middleware global de Content-Type** que causaba que los archivos HTML se sirvieran como JSON
2. **Puerto Vite dev corregido** de 8080 a 5173 (evita conflicto con backend en desarrollo)
3. **Variables de entorno completas** en easypanel.json y EASYPANEL_ENV_NUEVO.txt
4. **Dockerfile mejorado** con fallback tsx si el build TypeScript falla
5. **README actualizado** con instrucciones reales de despliegue
6. **.gitignore mejorado** — excluye scripts de test, logs de build, binarios
7. **backend/.env.example actualizado** con configuración completa PostgreSQL
8. **package.json** actualizado con nombre y versión correctos

