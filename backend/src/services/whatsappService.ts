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
import { fileURLToPath } from 'url';
import pinoLib from 'pino';
import { AIService } from './aiService.js';
import { query } from './db.js';

const pino = pinoLib as any;
const logger = pino({ level: 'silent' });
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class WhatsAppService {
    public sock: WASocket | null = null;
    private sessionId: string;
    private userId: string;

    constructor(sessionId: string, userId: string) {
        this.sessionId = sessionId;
        this.userId = userId;
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
                await query(
                    `UPDATE public.whatsapp_sessions SET qr_code=$1, status='qr_ready' WHERE id=$2`,
                    [qr, this.sessionId]
                );
            }

            if (connection === 'close') {
                const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
                const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

                await query(
                    `UPDATE public.whatsapp_sessions SET status='disconnected', qr_code=NULL WHERE id=$1`,
                    [this.sessionId]
                );

                console.log(`[WA] Conexión cerrada para ${this.sessionId}. Motivo: ${statusCode}. Reconectando: ${shouldReconnect}`);
                if (shouldReconnect) this.init();

            } else if (connection === 'open') {
                console.log(`[WA] ✅ Sesión Conectada: ${this.sessionId}`);
                await query(
                    `UPDATE public.whatsapp_sessions SET status='connected', qr_code=NULL, last_connected=$1 WHERE id=$2`,
                    [new Date().toISOString(), this.sessionId]
                );
            }
        });

        this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;

            for (const msg of messages) {
                if (!msg.message || msg.key.fromMe) continue;

                const remoteJid = msg.key.remoteJid!;
                const body = msg.message.conversation || msg.message.extendedTextMessage?.text;
                if (!body) continue;

                const senderPhone = remoteJid.replace('@s.whatsapp.net', '').replace('@c.us', '');
                const phoneVariants = [
                    senderPhone,
                    senderPhone.replace(/^57/, ''),
                    `57${senderPhone}`,
                ];

                // Buscar cliente con sus préstamos
                const clientRes = await query(`
                    SELECT c.*,
                        (SELECT json_agg(l.*) FROM public.loans l WHERE l.client_id = c.id) as loans
                    FROM public.clients c
                    WHERE c.user_id = $1
                      AND (c.phone ILIKE $2 OR c.phone ILIKE $3 OR c.phone ILIKE $4)
                    LIMIT 1
                `, [this.userId, `%${phoneVariants[0]}%`, `%${phoneVariants[1]}%`, `%${phoneVariants[2]}%`]);

                const clientData = clientRes?.rows?.[0];

                let clientContext = '';
                if (clientData) {
                    const loans = (clientData.loans as any[]) || [];
                    const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'defaulted');
                    clientContext = `
CLIENTE: ${clientData.full_name} | Tel: ${clientData.phone}
PRÉSTAMOS ACTIVOS (${activeLoans.length}):
${activeLoans.map(l => `• ${l.loan_number}: Saldo $${Number(l.remaining_amount).toLocaleString('es-CO')}, Cuota $${Number(l.installment_amount).toLocaleString('es-CO')} ${l.frequency}, ${l.paid_installments}/${l.installments} cuotas, Estado: ${l.status === 'defaulted' ? 'EN MORA' : 'Al día'}`).join('\n') || '- Sin préstamos activos'}`;
                } else {
                    clientContext = `NOTA: El número ${senderPhone} no está registrado como cliente.`;
                }

                const systemPrompt = `Eres un asistente de cobranza amable y profesional de Krédit.
Ayudas a los clientes con consultas sobre sus préstamos, fechas de pago y saldos.
Responde siempre en español, de forma breve y cordial. Máximo 3-4 oraciones.
Usa los datos reales del cliente para dar respuestas precisas.
Si está en mora, recuérdale amablemente y pide que se ponga al día.

${clientContext}`;

                await this.sock!.sendPresenceUpdate('composing', remoteJid);
                await delay(1200);

                const aiResponse = await AIService.getInstance().generateResponse(
                    systemPrompt,
                    body,
                    {
                        provider: process.env.AI_PROVIDER || 'ollama',
                        model: process.env.AI_MODEL || 'qwen2.5:0.5b',
                        baseUrl: process.env.AI_BASE_URL || undefined
                    }
                );

                await this.sock!.sendMessage(remoteJid, { text: aiResponse });

                // Guardar mensajes
                await query(
                    `INSERT INTO public.messages (session_id, sender_type, content) VALUES ($1, 'client', $2)`,
                    [this.sessionId, body]
                );
                await query(
                    `INSERT INTO public.messages (session_id, sender_type, content) VALUES ($1, 'agent', $2)`,
                    [this.sessionId, aiResponse]
                );
            }
        });
    }
}
