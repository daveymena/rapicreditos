import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { WhatsAppService } from './services/whatsappService.js';

dotenv.config();

// Validar variables críticas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_CHAT_MODEL || 'kimi-k2.5:cloud';
const OPENWEBUI_URL = process.env.OPENWEBUI_URL || 'https://n8n-ollama.ginee6.easypanel.host';

const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_API = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com';

app.use(cors({
    origin: process.env.APP_URL ? [process.env.APP_URL, 'http://localhost:8080', 'http://localhost:8081'] : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '1mb' }));

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const activeSessions: { [key: string]: WhatsAppService } = {};
const sessionLocks = new Set<string>(); // Prevenir race conditions
// ─── Proxy endpoint para el chatbot ───────────────────────
app.post('/api/chat', async (req, res) => {
    const { messages, systemPrompt } = req.body;
    if (!messages) return res.status(400).json({ error: 'messages requerido' });

    const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()?.content || '';

    // 1. Intentar Groq (rápido ~500ms)
    if (process.env.GROQ_API_KEY) {
        try {
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                },
                body: JSON.stringify({
                    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
                    messages: [
                        { role: 'system', content: systemPrompt || '' },
                        { role: 'user', content: lastUserMsg }
                    ],
                    max_tokens: 350,
                    temperature: 0.3,
                }),
                signal: AbortSignal.timeout(15000),
            });
            if (groqRes.ok) {
                const data = await groqRes.json() as any;
                const content = data.choices?.[0]?.message?.content?.trim() || '';
                console.log(`[Chat] Motor principal OK`);
                return res.json({ content, provider: 'ai' });
            }
        } catch (e: any) {
            console.warn('[Chat] Groq falló, intentando Kimi:', e.message);
        }
    }

    // 2. Kimi K2.5 via Open WebUI (Easypanel)
    try {
        const kimiRes = await fetch(`${OPENWEBUI_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'kimi-k2.5:cloud',
                messages: [
                    { role: 'system', content: systemPrompt || '' },
                    { role: 'user', content: lastUserMsg }
                ],
                max_tokens: 600,
                stream: false,
            }),
            signal: AbortSignal.timeout(40000),
        });
        if (kimiRes.ok) {
            const data = await kimiRes.json() as any;
            const content = data.choices?.[0]?.message?.content?.trim() || '';
            console.log(`[Chat] Motor secundario OK`);
            return res.json({ content, provider: 'ai' });
        }
    } catch (e: any) {
        console.warn('[Chat] Kimi falló, intentando Ollama:', e.message);
    }

    // 3. Fallback Ollama local
    try {
        const prompt = `${systemPrompt || ''}\n\nPregunta: ${lastUserMsg}\nRespuesta breve:`;
        const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                prompt,
                stream: false,
                options: { temperature: 0.2, num_predict: 250, num_ctx: 512, top_k: 10 }
            }),
            signal: AbortSignal.timeout(40000),
        });
        if (ollamaRes.ok) {
            const data = await ollamaRes.json() as { response: string };
            return res.json({ content: data.response?.trim() || '', provider: 'ollama' });
        }
    } catch (e: any) {
        console.warn('[Chat] Ollama falló:', e.message);
    }

    res.status(503).json({ error: 'IA no disponible temporalmente' });
});

// ─── MercadoPago: crear preferencia ───────────────────────
app.post('/api/payments/create-preference', async (req, res) => {
    const { amount, description, userId } = req.body;
    try {
        const origin = (req.headers.origin as string) || process.env.APP_URL || 'http://localhost:8080';
        const body = {
            items: [{
                id: 'rapicredi-pro',
                title: description || 'Suscripción RapiCréditos Pro',
                description: 'Plan mensual con IA y WhatsApp ilimitado',
                quantity: 1,
                unit_price: Number(amount) || 30000,
            }],
            back_urls: {
                success: `${origin}/dashboard?payment=success`,
                failure: `${origin}/pricing?payment=failed`,
                pending: `${origin}/pricing?payment=pending`,
            },
            external_reference: userId || 'unknown',
            statement_descriptor: 'RapiCreditos Pro',
        };

        const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'X-Idempotency-Key': `${userId}-${Date.now()}`,
            },
            body: JSON.stringify(body),
        });

        if (!mpRes.ok) {
            const err = await mpRes.text();
            console.error('[MP] Error:', err);
            return res.status(500).json({ error: 'Error creando preferencia MercadoPago' });
        }

        const data = await mpRes.json() as any;
        console.log(`[MP] Preferencia creada: ${data.id}`);
        res.json({ preferenceId: data.id, initPoint: data.init_point });
    } catch (e: any) {
        console.error('[MP] Error:', e.message);
        res.status(500).json({ error: e.message });
    }
});

// ─── MercadoPago: webhook de pago aprobado ─────────────────
app.post('/api/payments/mp-webhook', async (req, res) => {
    const { type, data } = req.body;
    if (type === 'payment' && data?.id) {
        try {
            const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
                headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
            });
            const payment = await payRes.json() as any;
            if (payment.status === 'approved' && payment.external_reference) {
                await supabase.from('profiles')
                    .update({ subscription_status: 'pro' })
                    .eq('user_id', payment.external_reference);
                console.log(`[MP] Plan Pro activado para: ${payment.external_reference}`);
            }
        } catch (e: any) {
            console.error('[MP] Webhook error:', e.message);
        }
    }
    res.sendStatus(200);
});

// ─── PayPal: crear orden ───────────────────────────────────
app.post('/api/payments/paypal-create-order', async (req, res) => {
    const { userId } = req.body;
    try {
        // Obtener token de acceso PayPal
        const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });
        const tokenData = await tokenRes.json() as any;
        const accessToken = tokenData.access_token;

        // Crear orden
        const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    description: 'Suscripción RapiCréditos Pro',
                    custom_id: userId,
                    amount: { currency_code: 'USD', value: '7.00' }
                }],
            }),
        });
        const order = await orderRes.json() as any;
        res.json({ orderId: order.id });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─── PayPal: capturar pago y activar Pro ──────────────────
app.post('/api/payments/paypal-capture', async (req, res) => {
    const { orderId, userId } = req.body;
    try {
        const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'grant_type=client_credentials',
        });
        const { access_token } = await tokenRes.json() as any;

        const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`,
            },
        });
        const capture = await captureRes.json() as any;

        if (capture.status === 'COMPLETED' && userId) {
            await supabase.from('profiles')
                .update({ subscription_status: 'pro' })
                .eq('user_id', userId);
            console.log(`[PayPal] Plan Pro activado para: ${userId}`);
            return res.json({ success: true });
        }
        res.json({ success: false, status: capture.status });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// ─── Scheduler de recordatorios automáticos ──────────────
async function sendDailyReminders() {
    console.log('[Scheduler] Ejecutando recordatorios diarios...');
    try {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Buscar préstamos activos con cuotas vencidas o que vencen hoy
        const { data: loans } = await supabase
            .from('loans')
            .select(`
                id, loan_number, installment_amount, frequency, end_date, user_id,
                clients (full_name, phone)
            `)
            .in('status', ['active', 'defaulted'])
            .lte('end_date', today);

        if (!loans || loans.length === 0) {
            console.log('[Scheduler] Sin préstamos vencidos hoy.');
            return;
        }

        for (const loan of loans) {
            const client = (loan as any).clients;
            if (!client?.phone) continue;

            // Buscar sesión WhatsApp activa del prestamista
            const { data: session } = await supabase
                .from('whatsapp_sessions')
                .select('id')
                .eq('user_id', loan.user_id)
                .eq('status', 'connected')
                .single();

            if (!session) continue;

            const phone = client.phone.replace(/\D/g, '');
            const jid = phone.startsWith('57') ? `${phone}@s.whatsapp.net` : `57${phone}@s.whatsapp.net`;

            const msg = `Hola ${client.full_name.split(' ')[0]} 👋, te recordamos que tienes una cuota pendiente del préstamo *${loan.loan_number}* por *$${Number(loan.installment_amount).toLocaleString('es-CO')}*.\n\nPor favor realiza tu pago a tiempo para evitar cargos adicionales. ¡Gracias! 🙏`;

            // Enviar via sesión activa en memoria
            const waService = activeSessions[session.id];
            if (waService) {
                await (waService as any).sock?.sendMessage(jid, { text: msg });
                console.log(`[Scheduler] Recordatorio enviado a ${client.full_name}`);

                // Registrar en messages
                await supabase.from('messages').insert([{
                    conversation_id: null,
                    sender_type: 'agent',
                    content: msg
                }]);
            }
        }
    } catch (error) {
        console.error('[Scheduler] Error:', error);
    }
}

// Ejecutar scheduler diario a las 8:00 AM
function scheduleDailyAt8AM() {
    const now = new Date();
    const next8AM = new Date();
    next8AM.setHours(8, 0, 0, 0);
    if (now >= next8AM) next8AM.setDate(next8AM.getDate() + 1);
    const msUntil8AM = next8AM.getTime() - now.getTime();

    setTimeout(() => {
        sendDailyReminders();
        setInterval(sendDailyReminders, 24 * 60 * 60 * 1000); // cada 24h
    }, msUntil8AM);

    console.log(`[Scheduler] Próximo envío de recordatorios: ${next8AM.toLocaleString('es-CO')}`);
}

async function monitorSessions() {
    console.log('[Sistema] Monitoreando sesiones en Supabase...');
    try {
        const { data: sessions, error } = await supabase
            .from('whatsapp_sessions')
            .select('*')
            .in('status', ['connected', 'qr_ready']);

        if (error) throw error;

        for (const session of sessions || []) {
            if (!activeSessions[session.id] && !sessionLocks.has(session.id)) {
                console.log(`[Sistema] Restaurando sesión: ${session.id}`);
                sessionLocks.add(session.id);
                try {
                    const wa = new WhatsAppService(session.id, session.user_id);
                    wa.init();
                    activeSessions[session.id] = wa;
                } finally {
                    sessionLocks.delete(session.id);
                }
            }
        }
    } catch (error) {
        console.error('[Sistema] Error monitoreando sesiones:', error);
    }
}

// Endpoint para despertar una sesión desde el frontend
app.post('/api/sessions/:id/restart', async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId requerido' });
    if (sessionLocks.has(id)) return res.json({ message: 'Sesión ya está iniciando' });

    // Verificar que la sesión pertenece al usuario
    const { data: session } = await supabase
        .from('whatsapp_sessions')
        .select('id, user_id')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

    if (!session) return res.status(403).json({ error: 'Sin permisos' });

    if (!activeSessions[id]) {
        sessionLocks.add(id);
        try {
            const wa = new WhatsAppService(id, userId);
            wa.init();
            activeSessions[id] = wa;
        } finally {
            sessionLocks.delete(id);
        }
    }

    res.json({ message: 'Procesando conexión' });
});

app.listen(PORT, () => {
    console.log(`🚀 [BACKEND] Krédit AI Heartbeat en puerto ${PORT}`);
    monitorSessions();
    scheduleDailyAt8AM();
});
