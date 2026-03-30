import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:6715320D@164.68.122.5:5436/posgres-db',
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Forzar UTF-8 en todas las conexiones
pool.on('connect', (client) => {
  client.query("SET client_encoding = 'UTF8'");
});

pool.on('error', (err) => {
  console.error('[DB] Error inesperado en pool:', err.message);
});

pool.connect().then(() => {
  console.log('🐘 PostgreSQL EasyPanel conectado correctamente');
}).catch(err => {
  console.error('❌ Error conectando a PostgreSQL:', err.message);
});

// Helper para queries tipadas
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (duration > 1000) console.warn(`[DB] Query lenta (${duration}ms):`, text.substring(0, 80));
  return res;
}

// Compatibilidad con código existente que usa db.query
export const db = {
  isPostgres: true,
  pool,
  query,
  // Stub de supabase para código legacy que aún lo use
  supabase: {
    from: (table: string) => ({
      select: () => ({ data: null, error: new Error('Usa db.query() directamente') }),
      insert: () => ({ data: null, error: new Error('Usa db.query() directamente') }),
      update: () => ({ data: null, error: new Error('Usa db.query() directamente') }),
      delete: () => ({ data: null, error: new Error('Usa db.query() directamente') }),
    })
  }
};

export default db;
