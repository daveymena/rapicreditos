import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { query } from './services/db.js';
import { registerUser, loginUser, getUserById, authMiddleware } from './services/authService.js';
import { WhatsAppService } from './services/whatsappService.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_CHAT_MODEL || 'qwen2.5:0.5b';
const OPENWEBUI_URL = process.env.OPENWEBUI_URL || 'https://n8n-ollama.ginee6.easypanel.host';
const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_API = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com';

app.use(cors({
  origin: process.env.APP_URL
    ? [process.env.APP_URL, 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:5173']
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '2mb' }));

const activeSessions: { [key: string]: WhatsAppService } = {};
const sessionLocks = new Set<string>();

// ─── AUTH ROUTES ──────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  const { email, password, full_name, business_name, phone } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ error: 'email, password y full_name son requeridos' });
  }
  try {
    const result = await registerUser(email, password, full_name, business_name, phone);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email y password requeridos' });
  try {
    const result = await loginUser(email, password);
    res.json(result);
  } catch (e: any) {
    res.status(401).json({ error: e.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req: any, res) => {
  const user = await getUserById(req.user.userId);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json({ user });
});

app.put('/api/auth/profile', authMiddleware, async (req: any, res) => {
  const { full_name, business_name, phone, address, avatar_url } = req.body;
  try {
    const result = await query(
      `UPDATE public.users SET full_name=$1, business_name=$2, phone=$3, address=$4, avatar_url=$5
       WHERE id=$6 RETURNING id, email, full_name, business_name, phone, address, avatar_url, subscription_status`,
      [full_name, business_name, phone, address, avatar_url, req.user.userId]
    );
    res.json({ user: result.rows[0] });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── CLIENTS ROUTES ───────────────────────────────────────

app.get('/api/clients', authMiddleware, async (req: any, res) => {
  const result = await query(
    'SELECT * FROM public.clients WHERE user_id=$1 ORDER BY created_at DESC',
    [req.user.userId]
  );
  res.json(result.rows);
});

app.post('/api/clients', authMiddleware, async (req: any, res) => {
  const { full_name, document_number, document_type, phone, email, address, city, occupation,
    monthly_income, reference_name, reference_phone, reference_relationship, notes } = req.body;
  try {
    const result = await query(
      `INSERT INTO public.clients (user_id, full_name, document_number, document_type, phone, email,
        address, city, occupation, monthly_income, reference_name, reference_phone, reference_relationship, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [req.user.userId, full_name, document_number, document_type || 'CC', phone, email,
        address, city, occupation, monthly_income, reference_name, reference_phone, reference_relationship, notes]
    );
    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/clients/:id', authMiddleware, async (req: any, res) => {
  const result = await query(
    'SELECT * FROM public.clients WHERE id=$1 AND user_id=$2',
    [req.params.id, req.user.userId]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(result.rows[0]);
});

app.put('/api/clients/:id', authMiddleware, async (req: any, res) => {
  const { full_name, document_number, document_type, phone, email, address, city, occupation,
    monthly_income, reference_name, reference_phone, reference_relationship, notes, status } = req.body;
  try {
    const result = await query(
      `UPDATE public.clients SET full_name=$1, document_number=$2, document_type=$3, phone=$4, email=$5,
        address=$6, city=$7, occupation=$8, monthly_income=$9, reference_name=$10, reference_phone=$11,
        reference_relationship=$12, notes=$13, status=$14
       WHERE id=$15 AND user_id=$16 RETURNING *`,
      [full_name, document_number, document_type, phone, email, address, city, occupation,
        monthly_income, reference_name, reference_phone, reference_relationship, notes, status,
        req.params.id, req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/clients/:id', authMiddleware, async (req: any, res) => {
  await query('DELETE FROM public.clients WHERE id=$1 AND user_id=$2', [req.params.id, req.user.userId]);
  res.json({ success: true });
});

// ─── LOANS ROUTES ─────────────────────────────────────────

app.get('/api/loans', authMiddleware, async (req: any, res) => {
  const result = await query(
    `SELECT l.*, c.full_name as client_name, c.phone as client_phone
     FROM public.loans l
     JOIN public.clients c ON c.id = l.client_id
     WHERE l.user_id=$1 ORDER BY l.created_at DESC`,
    [req.user.userId]
  );
  res.json(result.rows);
});

app.post('/api/loans', authMiddleware, async (req: any, res) => {
  const { client_id, principal_amount, interest_rate, interest_type, total_interest, total_amount,
    installments, installment_amount, frequency, start_date, end_date, remaining_amount, notes } = req.body;
  try {
    const result = await query(
      `INSERT INTO public.loans (user_id, client_id, principal_amount, interest_rate, interest_type,
        total_interest, total_amount, installments, installment_amount, frequency, start_date, end_date,
        remaining_amount, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [req.user.userId, client_id, principal_amount, interest_rate, interest_type || 'simple',
        total_interest, total_amount, installments, installment_amount, frequency,
        start_date, end_date, remaining_amount || total_amount, notes]
    );
    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/loans/:id', authMiddleware, async (req: any, res) => {
  const result = await query(
    `SELECT l.*, c.full_name as client_name, c.phone as client_phone, c.document_number
     FROM public.loans l JOIN public.clients c ON c.id = l.client_id
     WHERE l.id=$1 AND l.user_id=$2`,
    [req.params.id, req.user.userId]
  );
  if (!result.rows[0]) return res.status(404).json({ error: 'Préstamo no encontrado' });
  res.json(result.rows[0]);
});

app.put('/api/loans/:id', authMiddleware, async (req: any, res) => {
  const { status, paid_amount, paid_installments, remaining_amount, notes } = req.body;
  try {
    const result = await query(
      `UPDATE public.loans SET status=$1, paid_amount=$2, paid_installments=$3, remaining_amount=$4, notes=$5
       WHERE id=$6 AND user_id=$7 RETURNING *`,
      [status, paid_amount, paid_installments, remaining_amount, notes, req.params.id, req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── PAYMENTS ROUTES ──────────────────────────────────────

app.get('/api/loans/:loanId/payments', authMiddleware, async (req: any, res) => {
  const result = await query(
    'SELECT * FROM public.payments WHERE loan_id=$1 AND user_id=$2 ORDER BY payment_number',
    [req.params.loanId, req.user.userId]
  );
  res.json(result.rows);
});

app.post('/api/loans/:loanId/payments', authMiddleware, async (req: any, res) => {
  const { payment_number, amount, principal_portion, interest_portion, late_fee,
    payment_date, due_date, payment_method, notes } = req.body;
  try {
    const result = await query(
      `INSERT INTO public.payments (user_id, loan_id, payment_number, amount, principal_portion,
        interest_portion, late_fee, payment_date, due_date, payment_method, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'paid',$11) RETURNING *`,
      [req.user.userId, req.params.loanId, payment_number, amount, principal_portion || 0,
        interest_portion || 0, late_fee || 0, payment_date, due_date, payment_method || 'cash', notes]
    );

    // Actualizar préstamo
    await query(
      `UPDATE public.loans SET
        paid_amount = paid_amount + $1,
        paid_installments = paid_installments + 1,
        remaining_amount = remaining_amount - $1,
        status = CASE WHEN remaining_amount - $1 <= 0 THEN 'completed' ELSE status END
       WHERE id=$2 AND user_id=$3`,
      [amount, req.params.loanId, req.user.userId]
    );

    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── DASHBOARD STATS ──────────────────────────────────────

app.get('/api/dashboard/stats', authMiddleware, async (req: any, res) => {
  try {
    const [clients, loans, payments] = await Promise.all([
      query('SELECT COUNT(*) as total FROM public.clients WHERE user_id=$1 AND status=$2', [req.user.userId, 'active']),
      query(`SELECT COUNT(*) as total, SUM(total_amount) as capital, SUM(remaining_amount) as pendiente
             FROM public.loans WHERE user_id=$1 AND status='active'`, [req.user.userId]),
      query(`SELECT SUM(amount) as total FROM public.payments
             WHERE user_id=$1 AND payment_date >= date_trunc('month', CURRENT_DATE)`, [req.user.userId]),
    ]);

    res.json({
      active_clients: parseInt(clients.rows[0].total),
      active_loans: parseInt(loans.rows[0].total),
      total_capital: parseFloat(loans.rows[0].capital) || 0,
      pending_amount: parseFloat(loans.rows[0].pendiente) || 0,
      monthly_collected: parseFloat(payments.rows[0].total) || 0,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── WHATSAPP SESSIONS ────────────────────────────────────

app.get('/api/whatsapp/sessions', authMiddleware, async (req: any, res) => {
  const result = await query(
    'SELECT * FROM public.whatsapp_sessions WHERE user_id=$1',
    [req.user.userId]
  );
  res.json(result.rows);
});

app.post('/api/whatsapp/sessions', authMiddleware, async (req: any, res) => {
  try {
    const result = await query(
      `INSERT INTO public.whatsapp_sessions (user_id, status)
       VALUES ($1, 'disconnected') RETURNING *`,
      [req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/sessions/:id/restart', authMiddleware, async (req: any, res) => {
  const { id } = req.params;
  if (sessionLocks.has(id)) return res.json({ message: 'Sesión ya está iniciando' });

  const result = await query(
    'SELECT id, user_id FROM public.whatsapp_sessions WHERE id=$1 AND user_id=$2',
    [id, req.user.userId]
  );
  if (!result.rows[0]) return res.status(403).json({ error: 'Sin permisos' });

  if (!activeSessions[id]) {
    sessionLocks.add(id);
    try {
      const wa = new WhatsAppService(id, req.user.userId);
      wa.init();
      activeSessions[id] = wa;
    } finally {
      sessionLocks.delete(id);
    }
  }
  res.json({ message: 'Procesando conexión' });
});

// ─── CHAT (IA) ────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt } = req.body;
  if (!messages) return res.status(400).json({ error: 'messages requerido' });

  const lastUserMsg = messages.filter((m: any) => m.role === 'user').pop()?.content || '';

  if (process.env.GROQ_API_KEY) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
          messages: [{ role: 'system', content: systemPrompt || '' }, { role: 'user', content: lastUserMsg }],
          max_tokens: 350, temperature: 0.3,
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (groqRes.ok) {
        const data = await groqRes.json() as any;
        return res.json({ content: data.choices?.[0]?.message?.content?.trim() || '', provider: 'groq' });
      }
    } catch (e: any) { console.warn('[Chat] Groq falló:', e.message); }
  }

  try {
    const ollamaRes = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: `${systemPrompt || ''}\n\nPregunta: ${lastUserMsg}\nRespuesta:`,
        stream: false,
        options: { temperature: 0.2, num_predict: 250 }
      }),
      signal: AbortSignal.timeout(40000),
    });
    if (ollamaRes.ok) {
      const data = await ollamaRes.json() as { response: string };
      return res.json({ content: data.response?.trim() || '', provider: 'ollama' });
    }
  } catch (e: any) { console.warn('[Chat] Ollama falló:', e.message); }

  res.status(503).json({ error: 'IA no disponible temporalmente' });
});

// ─── PAYMENTS (MercadoPago / PayPal) ─────────────────────

app.post('/api/payments/create-preference', authMiddleware, async (req: any, res) => {
  const { amount, description } = req.body;
  try {
    const origin = (req.headers.origin as string) || process.env.APP_URL || 'http://localhost:8080';
    const body = {
      items: [{ id: 'rapicredi-pro', title: description || 'Suscripción RapiCréditos Pro', quantity: 1, unit_price: Number(amount) || 30000 }],
      back_urls: {
        success: `${origin}/dashboard?payment=success`,
        failure: `${origin}/pricing?payment=failed`,
        pending: `${origin}/pricing?payment=pending`,
      },
      external_reference: req.user.userId,
    };
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` },
      body: JSON.stringify(body),
    });
    const data = await mpRes.json() as any;
    res.json({ preferenceId: data.id, initPoint: data.init_point });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/payments/mp-webhook', async (req, res) => {
  const { type, data } = req.body;
  if (type === 'payment' && data?.id) {
    try {
      const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
      });
      const payment = await payRes.json() as any;
      if (payment.status === 'approved' && payment.external_reference) {
        await query('UPDATE public.users SET subscription_status=$1 WHERE id=$2', ['pro', payment.external_reference]);
        console.log(`[MP] Plan Pro activado para: ${payment.external_reference}`);
      }
    } catch (e: any) { console.error('[MP] Webhook error:', e.message); }
  }
  res.sendStatus(200);
});

app.post('/api/payments/paypal-create-order', authMiddleware, async (req: any, res) => {
  try {
    const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    const { access_token } = await tokenRes.json() as any;
    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` },
      body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [{ description: 'RapiCréditos Pro', custom_id: req.user.userId, amount: { currency_code: 'USD', value: '7.00' } }] }),
    });
    const order = await orderRes.json() as any;
    res.json({ orderId: order.id });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/payments/paypal-capture', authMiddleware, async (req: any, res) => {
  const { orderId } = req.body;
  try {
    const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials',
    });
    const { access_token } = await tokenRes.json() as any;
    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${access_token}` },
    });
    const capture = await captureRes.json() as any;
    if (capture.status === 'COMPLETED') {
      await query('UPDATE public.users SET subscription_status=$1 WHERE id=$2', ['pro', req.user.userId]);
      return res.json({ success: true });
    }
    res.json({ success: false });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

// ─── SCHEDULER ────────────────────────────────────────────

async function sendDailyReminders() {
  console.log('[Scheduler] Ejecutando recordatorios diarios...');
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await query(
      `SELECT l.id, l.loan_number, l.installment_amount, l.user_id,
              c.full_name, c.phone
       FROM public.loans l
       JOIN public.clients c ON c.id = l.client_id
       WHERE l.status IN ('active', 'defaulted') AND l.end_date <= $1`,
      [today]
    );

    for (const loan of result.rows) {
      if (!loan.phone) continue;
      const sessionRes = await query(
        "SELECT id FROM public.whatsapp_sessions WHERE user_id=$1 AND status='connected' LIMIT 1",
        [loan.user_id]
      );
      if (!sessionRes.rows[0]) continue;

      const sessionId = sessionRes.rows[0].id;
      const phone = loan.phone.replace(/\D/g, '');
      const jid = phone.startsWith('57') ? `${phone}@s.whatsapp.net` : `57${phone}@s.whatsapp.net`;
      const msg = `Hola ${loan.full_name.split(' ')[0]} 👋, tienes una cuota pendiente del préstamo *${loan.loan_number}* por *${Number(loan.installment_amount).toLocaleString('es-CO')}*. Por favor realiza tu pago. ¡Gracias! 🙏`;

      const waService = activeSessions[sessionId];
      if (waService) {
        await (waService as any).sock?.sendMessage(jid, { text: msg });
        console.log(`[Scheduler] Recordatorio enviado a ${loan.full_name}`);
      }
    }
  } catch (error) {
    console.error('[Scheduler] Error:', error);
  }
}

function scheduleDailyAt8AM() {
  const now = new Date();
  const next8AM = new Date();
  next8AM.setHours(8, 0, 0, 0);
  if (now >= next8AM) next8AM.setDate(next8AM.getDate() + 1);
  setTimeout(() => {
    sendDailyReminders();
    setInterval(sendDailyReminders, 24 * 60 * 60 * 1000);
  }, next8AM.getTime() - now.getTime());
  console.log(`[Scheduler] Próximo recordatorio: ${next8AM.toLocaleString('es-CO')}`);
}

async function monitorSessions() {
  try {
    const result = await query(
      "SELECT * FROM public.whatsapp_sessions WHERE status IN ('connected', 'qr_ready')"
    );
    for (const session of result.rows) {
      if (!activeSessions[session.id] && !sessionLocks.has(session.id)) {
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

// ─── STATIC FILES ─────────────────────────────────────────

const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ error: 'Frontend no compilado aún' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [BACKEND] RapiCréditos en puerto ${PORT}`);
  console.log(`🐘 Base de datos: PostgreSQL EasyPanel`);
  monitorSessions();
  scheduleDailyAt8AM();
});
