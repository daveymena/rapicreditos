import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    type WASocket,
    delay
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import pino from 'pino';
import { AIService } from './aiService';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = pino({ level: 'silent' });

export class WhatsAppService {
    public sock: WASocket | null = null;
    private sessionId: string;
    private userId: string;
    private supabase;

    constructor(sessionId: string, userId: string) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
    }

    async init() {
        console.log(`[WA] Inicializando sesión: ${this.sessionId}`);

        const { state, saveCreds } = await useMultiFileAuthState(
            path.join(__dirname, `../../sessions/${this.sessionId}`)
        );

        const { version } = await fetchLatestBaileysVersion();

        this.sock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            logger,
            browser: ['RapiCredi AI', 'Chrome', '1.0.0']
        });

        this.sock.ev.on('creds.update', saveCreds);

        this.sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                console.log(`[WA] QR generado para ${this.sessionId}`);
                await this.supabase
                    .from('whatsapp_sessions')
                    .update({ qr_code: qr, status: 'qr_ready' })
                    .eq('id', this.sessionId);
            }

            if (connection === 'close') {
                const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                await this.supabase
                    .from('whatsapp_sessions')
                    .update({ status: 'disconnected', qr_code: null })
                    .eq('id', this.sessionId);

                console.log(`[WA] Conexión cerrada para ${this.sessionId}. Motivo: ${statusCode}. Reconectando: ${shouldReconnect}`);
                if (shouldReconnect) this.init();
            } else if (connection === 'open') {
                console.log(`[WA] ✅ Sesión Conectada: ${this.sessionId}`);
                await this.supabase
                    .from('whatsapp_sessions')
                    .update({
                        status: 'connected',
                        qr_code: null,
                        last_connected_at: new Date().toISOString()
                    })
                    .eq('id', this.sessionId);
            }
        });

        this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;

            for (const msg of messages) {
                if (!msg.message || msg.key.fromMe) continue;

                const remoteJid = msg.key.remoteJid!;
                const body = msg.message.conversation || msg.message.extendedTextMessage?.text;

                if (!body) continue;

                // 1. Obtener configuración de la sesión
                const { data: session } = await this.supabase
                    .from('whatsapp_sessions')
                    .select('agent_id')
                    .eq('id', this.sessionId)
                    .single();

                // 2. Obtener prompt del agente (o usar prompt de cobranza por defecto)
                let systemPrompt = `Eres un asistente de cobranza amable y profesional de Krédit. 
Ayudas a los clientes con consultas sobre sus préstamos, fechas de pago y saldos pendientes.
Responde siempre en español, de forma breve y cordial. Máximo 3 oraciones.
Si el cliente pregunta por su saldo o cuota, dile que puede consultarlo directamente con su asesor.`;
                let modelName = process.env.AI_PROVIDER === 'groq'
                    ? (process.env.GROQ_MODEL || 'llama-3.1-8b-instant')
                    : (process.env.AI_MODEL || 'qwen2.5:0.5b');

                if (session?.agent_id) {
                    const { data: agent } = await this.supabase
                        .from('ai_agents')
                        .select('system_prompt, model_name, temperature')
                        .eq('id', session.agent_id)
                        .single();

                    if (agent) {
                        systemPrompt = agent.system_prompt;
                        modelName = agent.model_name;
                    }
                }

                await this.sock!.sendPresenceUpdate('composing', remoteJid);
                await delay(1200);

                const aiResponse = await AIService.getInstance().generateResponse(
                    systemPrompt,
                    body,
                    {
                        provider: process.env.AI_PROVIDER || 'ollama',
                        model: modelName,
                        baseUrl: process.env.AI_BASE_URL || undefined
                    }
                );

                await this.sock!.sendMessage(remoteJid, { text: aiResponse });

                // Guardar mensaje en historial
                const convId = await this.getOrCreateConversation(remoteJid, session?.agent_id || 'default');
                await this.supabase.from('messages').insert([{
                    conversation_id: convId,
                    sender_type: 'agent',
                    content: aiResponse
                }]);
            }
        });
    }

    private async getOrCreateConversation(customerPhone: string, agentId: string) {
        const { data: conv } = await this.supabase
            .from('conversations')
            .select('id')
            .eq('customer_phone', customerPhone)
            .eq('user_id', this.userId)
            .single();

        if (conv) return conv.id;

        const { data: newConv } = await this.supabase
            .from('conversations')
            .insert([{
                user_id: this.userId,
                session_id: this.sessionId,
                customer_phone: customerPhone,
                agent_id: agentId,
                status: 'active'
            }])
            .select()
            .single();

        return newConv.id;
    }
}
