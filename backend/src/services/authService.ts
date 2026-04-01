import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db.js';
import { activeSessions } from '../index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'rapicredi_jwt_secret_2026_super_secure_key';
const JWT_EXPIRES = '7d';

export interface JwtPayload {
  userId: string;
  email: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Registro de usuario
export async function registerUser(email: string, password: string, fullName: string, businessName?: string, phone?: string) {
  // Verificar si ya existe
  const existing = await query('SELECT id FROM public.users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    throw new Error('El correo ya está registrado');
  }

  const passwordHash = await hashPassword(password);
  const res = await query(
    `INSERT INTO public.users (email, password_hash, full_name, business_name, phone, email_confirmed)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING id, email, full_name, business_name, phone, subscription_status, created_at`,
    [email.toLowerCase(), passwordHash, fullName, businessName || null, phone || null]
  );

  const user = res.rows[0];
  const token = signToken({ userId: user.id, email: user.email });
  return { user, token };
}

// Login
export async function loginUser(email: string, password: string) {
  const res = await query(
    'SELECT * FROM public.users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (res.rows.length === 0) {
    throw new Error('Credenciales incorrectas');
  }

  const user = res.rows[0];
  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    throw new Error('Credenciales incorrectas');
  }

  // Si tiene 2FA habilitado
  if (user.two_factor_enabled) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await query('UPDATE public.users SET otp_code = $1 WHERE id = $2', [otp, user.id]);
    
    // Intentar enviar por WhatsApp si hay sesión activa
    const waSessions = await query("SELECT id FROM public.whatsapp_sessions WHERE user_id=$1 AND status='connected' LIMIT 1", [user.id]);
    if (waSessions.rows.length > 0 && user.phone) {
        const sid = waSessions.rows[0].id;
        const wa = activeSessions[sid];
        if (wa && wa.sock) {
            const jid = `${user.phone.replace(/\D/g, '')}@s.whatsapp.net`;
            await wa.sock.sendMessage(jid, { 
                text: `*Krédit Pro - Seguridad*\n\nTu código de verificación es: *${otp}*\n\nEste código es válido por 10 minutos. No lo compartas con nadie.` 
            });
            console.log(`[2FA] Código enviado por WhatsApp a ${user.phone}`);
        }
    }

    console.log(`[2FA] Código para ${user.email}: ${otp}`);
    
    return { requires2FA: true, userId: user.id };
  }

  const token = signToken({ userId: user.id, email: user.email });
  const { password_hash, reset_token, otp_code, ...safeUser } = user;
  return { user: safeUser, token };
}

// Verificar 2FA
export async function verify2FA(userId: string, code: string) {
  const res = await query('SELECT * FROM public.users WHERE id = $1', [userId]);
  if (res.rows.length === 0) throw new Error('Usuario no encontrado');

  const user = res.rows[0];
  if (user.otp_code !== code) {
    throw new Error('Código incorrecto');
  }

  // Limpiar código tras verificación
  await query('UPDATE public.users SET otp_code = NULL WHERE id = $1', [userId]);

  const token = signToken({ userId: user.id, email: user.email });
  const { password_hash, reset_token, otp_code, ...safeUser } = user;
  return { user: safeUser, token };
}

// Obtener usuario por ID
export async function getUserById(userId: string) {
  const res = await query(
    `SELECT id, email, full_name, business_name, phone, address, avatar_url,
            subscription_status, whatsapp_connected,
            COALESCE(payment_qr_url, '') as payment_qr_url,
            COALESCE(payment_instructions, '') as payment_instructions,
            created_at, updated_at
     FROM public.users WHERE id = $1`,
    [userId]
  );
  return res.rows[0] || null;
}

// Middleware para verificar JWT en Express
export function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
