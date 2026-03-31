# 💎 RapiCréditos Pro

<div align="center">

![RapiCréditos](https://img.shields.io/badge/RapiCréditos-Pro-emerald?style=for-the-badge)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![EasyPanel](https://img.shields.io/badge/EasyPanel-Ready-orange?style=for-the-badge)

**Plataforma Profesional de Gestión de Préstamos con Inteligencia Artificial**

[Demo en Producción](https://ollama-rapicredisas2.ginee6.easypanel.host) · [Guía de Uso](./GUIA_DE_USO.md) · [Configuración EasyPanel](./INSTRUCCIONES_DESPLIEGUE.md)

</div>

---

## 🌟 Características Principales

### 🤖 Inteligencia Artificial Integrada
- **Ollama AI** - Procesamiento local y en la nube para análisis de clientes
- **Groq** - Motor de IA ultra-rápido como alternativa
- Generación automática de mensajes de cobro personalizados
- Respuestas inteligentes por WhatsApp a clientes

### 💬 Integración WhatsApp (Baileys)
- Sincronización mediante código QR
- Bot de cobranza automático con IA
- Recordatorios diarios automáticos (8:00 AM)
- Mensajes personalizados con datos del cliente

### 📊 Dashboard Analítico
- **Capital en la Calle:** Dinero total prestado activo
- **Clientes Activos:** Gestión completa de cartera
- **Préstamos en Mora:** Alertas automáticas
- **Ganancias Totales:** Cobros registrados

### 🧮 Simulador Inteligente
- Cálculo automático de cuotas (diario, semanal, quincenal, mensual)
- Múltiples tipos de interés (simple y compuesto)
- Proyección de fechas de vencimiento

### 💳 Pagos Integrados
- **MercadoPago** - Para clientes en Colombia (COP)
- **PayPal** - Para clientes internacionales (USD)
- Webhooks automáticos para activar suscripciones

---

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 20+
- PostgreSQL 14+
- npm

### Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/daveymena/repicreditosst.git
cd repicreditosst

# 2. Instalar dependencias del frontend
npm install

# 3. Instalar dependencias del backend
cd backend
npm install
cd ..

# 4. Configurar variables de entorno del backend
cp backend/.env.example backend/.env
# Editar backend/.env con tus credenciales

# 5. Levantar el backend (puerto 3001)
npm run dev:backend

# 6. En otra terminal, levantar el frontend (puerto 5173)
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- *El frontend hace proxy de /api/* → localhost:3001*

---

## 🗄️ Base de Datos

### Esquema PostgreSQL

Ejecutar en orden en tu base de datos PostgreSQL:

```sql
-- 1. Schema principal
\i SCHEMA_SUPABASE.sql

-- O el schema completo con todas las tablas:
\i SCHEMA_COMPLETO.sql
```

### Tablas principales:
- **`users`** - Usuarios/prestamistas del sistema
- **`clients`** - Clientes de cada prestamista
- **`loans`** - Préstamos activos y completados
- **`payments`** - Registro de pagos
- **`whatsapp_sessions`** - Sesiones de WhatsApp por usuario
- **`messages`** - Historial de mensajes del bot

---

## 🚢 Despliegue en EasyPanel

### Configuración Automática

EasyPanel puede desplegar directamente desde este repositorio usando el `Dockerfile` incluido.

```bash
# Configurar en EasyPanel:
# 1. Fuente: GitHub → daveymena/repicreditosst → main
# 2. Build: Dockerfile
# 3. Puerto: 8080
# 4. Variables de entorno: copiar desde EASYPANEL_ENV_NUEVO.txt
```

### Variables de Entorno Requeridas

Ver el archivo `EASYPANEL_ENV_NUEVO.txt` para la lista completa.

Las variables críticas:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `JWT_SECRET` | Clave secreta para tokens JWT |
| `PORT` | Puerto del servidor (8080) |
| `APP_URL` | URL pública de tu app |
| `OLLAMA_BASE_URL` | URL del servidor Ollama para IA |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de MercadoPago |
| `PAYPAL_CLIENT_ID` | Client ID de PayPal |

### Arquitectura en Producción

```
Internet → EasyPanel (puerto 8080)
              ├── Express Backend (Node.js)
              │   ├── /api/* → REST API endpoints
              │   └── /* → Archivos estáticos del frontend (Vite build)
              └── PostgreSQL (servicio interno EasyPanel)
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + **TypeScript**
- **Vite** - Build tool ultra rápido
- **TailwindCSS** + **Shadcn/ui** - Componentes premium
- **Framer Motion** - Animaciones fluidas
- **React Query** - Gestión de estado del servidor

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** - Base de datos principal
- **JWT** - Autenticación stateless
- **Baileys** - Integración WhatsApp Web
- **bcryptjs** - Hash seguro de contraseñas

### IA & Automatización
- **Ollama** - Modelos de IA locales/en la nube
- **Groq API** - Inferencia ultra-rápida (alternativa)
- **WhatsApp Baileys** - Bot de cobranza automatizado

---

## 📁 Estructura del Proyecto

```
repicreditosst/
├── src/                    # Frontend React/TypeScript
│   ├── components/         # Componentes reutilizables
│   ├── pages/              # Páginas de la app
│   ├── lib/                # Utilidades y cliente API
│   └── integrations/       # Integraciones (Supabase types)
├── backend/                # Backend Express/TypeScript
│   ├── src/
│   │   ├── index.ts        # Servidor principal + todas las rutas
│   │   └── services/       # Servicios (DB, Auth, WhatsApp, AI)
│   ├── .env.example        # Template de variables de entorno
│   └── package.json
├── Dockerfile              # Build multi-stage para EasyPanel
├── easypanel.json          # Configuración de EasyPanel
├── EASYPANEL_ENV_NUEVO.txt # Variables de entorno para EasyPanel
├── SCHEMA_SUPABASE.sql     # Esquema base de PostgreSQL
└── SCHEMA_COMPLETO.sql     # Esquema completo con todas las tablas
```

---

## 🔐 Seguridad

- ✅ JWT con expiración de 7 días
- ✅ Contraseñas hasheadas con bcrypt (12 rounds)
- ✅ Validación de ownership en cada endpoint (user_id)
- ✅ CORS configurado para dominios específicos
- ✅ Rate limiting implícito en API

---

## 👨‍💻 Autor

**Davey Mena**
- GitHub: [@daveymena](https://github.com/daveymena)

---

<div align="center">

**RapiCréditos Pro** - *Profesionalizando el arte de prestar* 💎

Hecho con ❤️ y ☕

</div>
