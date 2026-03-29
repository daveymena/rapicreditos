import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { WhatsAppService } from './services/whatsappService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del Frontend (build)
// En producción (Docker), 'dist' (backend) y 'public' (frontend) están en /app
// Así que desde /app/dist/index.js, bajamos a /app/public
app.use(express.static(path.join(__dirname, '../public')));

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const activeSessions: { [key: string]: WhatsAppService } = {};

async function monitorSessions() {
    console.log('[System] Monitoreando sesiones en Supabase...');

    // Solo iniciar sesiones que estaban conectadas previamente
    const { data: sessions, error } = await supabase
        .from('whatsapp_sessions')
        .select('*')
        .in('status', ['connected', 'qr_ready']);

    if (error) {
        console.error('[System] Error cargando sesiones:', error);
        return;
    }

    if (sessions) {
        for (const session of sessions) {
            if (!activeSessions[session.id]) {
                console.log(`[System] Restaurando sesión: ${session.id}`);
                const wa = new WhatsAppService(session.id, session.user_id);
                wa.init();
                activeSessions[session.id] = wa;
            }
        }
    }
}

// Endpoint para despertar una sesión desde el frontend
app.post('/api/sessions/:id/restart', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'userId requerido' });
    }

    // Verificar que la sesión pertenece al usuario
    const { data: session, error } = await supabase
        .from('whatsapp_sessions')
        .select('id, user_id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

    if (error || !session) {
        return res.status(403).json({ error: 'Sesión no encontrada o sin permisos' });
    }

    console.log(`[API] Petición de reinicio para sesión: ${id}`);

    if (!activeSessions[id]) {
        const wa = new WhatsAppService(id, userId);
        wa.init();
        activeSessions[id] = wa;
    }

    res.json({ message: 'Procesando conexión' });
});

// Catch-all para SPA (Frontend)
app.get('*', (req, res) => {
    // Si es una ruta de API que no existe, devolver 404 JSON
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    // Para cualquier otra cosa, devolver el index.html de React
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 [BACKEND] RapiCredi AI Heartbeat en puerto ${PORT}`);
    monitorSessions();
});
