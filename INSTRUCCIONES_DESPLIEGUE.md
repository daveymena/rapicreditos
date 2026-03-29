# 🚀 Guía de Despliegue RapiCréditos AI en Easypanel

Esta guía te ayudará a dejar tu aplicación 100% funcional en producción.

## 1. Despliegue de la Aplicación Principal
Esta aplicación incluye **Frontend (React)** y **Backend (Node.js)** en un solo servicio unificado.

1.  Crea un nuevo **Service** en tu proyecto de Easypanel.
2.  **Source**: Git (conecta tu repositorio).
3.  **Build**: Easypanel detectará automáticamente el `Dockerfile`.
4.  **Environment Variables**:
    *   `SUPABASE_URL`: Tu URL de Supabase.
    *   `SUPABASE_SERVICE_ROLE_KEY`: Tu Key secreta (service role) de Supabase.
    *   `VITE_SUPABASE_URL`: (Mismo que arriba).
    *   `VITE_SUPABASE_PUBLISHABLE_KEY`: Tu Key pública de Supabase.
    *   `VITE_BACKEND_URL`: `https://tu-dominio-easypanel.com` (IMPORTANTE: Sin barra al final).

## 2. Instalación de OpenClaw (Agente Autónomo)
Para que los "Agentes IA" puedan realizar tareas complejas (navegar, investigar), necesitas desplegar OpenClaw como un servicio separado.

1.  Crea *otro* **Service** en Easypanel.
2.  **Name**: `openclaw`
3.  **Source**: Git
    *   URL: `https://github.com/openclaw/openclaw`
4.  **Storage** (Persistencia):
    *   Crea un volumen montado en `/root/.openclaw` para guardar la memoria del cerebro.
5.  **Environment**:
    *   Configura tus llaves de LLM (OpenAI, Anthropic) según la documentación de OpenClaw.

## 3. Conexión Final (Opcional pero Recomendado)
Para que OpenClaw pueda "leer" tu base de datos de RapiCréditos:
1.  En OpenClaw, crea una "Skill" o "Tool" que use la API de Supabase para leer la tabla `loans` o `clients`.
2.  Así tu agente podrá responder cosas como "¿Quién me debe dinero hoy?".

---
**¡Listo!** Ahora tienes una Super App financiera con un cerebro artificial real corriendo en tu propia infraestructura.
