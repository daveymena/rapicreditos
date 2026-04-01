// run-column-migration.cjs
// Agrega columnas faltantes a la BD de producción
// Uso: node run-column-migration.cjs

const { Pool } = require('pg');

const DATABASE_URL = 'postgres://postgres:6715320D@164.68.122.5:5436/posgres-db';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: false,
  connectionTimeoutMillis: 15000,
});

const migrations = [
  // Columnas de pago en users
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS payment_qr_url TEXT`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS payment_instructions TEXT`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT FALSE`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE`,
  `ALTER TABLE public.users ADD COLUMN IF NOT EXISTS otp_code TEXT`,
  
  // Columna de días de cobro en loans
  `ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS collection_start_days INTEGER DEFAULT 1`,
  
  // Columna error_message en whatsapp_sessions (usada por el servicio)
  `ALTER TABLE public.whatsapp_sessions ADD COLUMN IF NOT EXISTS error_message TEXT`,

  // Tabla de agentes si no existe
  `CREATE TABLE IF NOT EXISTS public.ai_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    name TEXT NOT NULL,
    system_prompt TEXT,
    model_name TEXT DEFAULT 'qwen2.5:3b',
    temperature FLOAT DEFAULT 0.7,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`
];

async function run() {
  console.log('🔄 Conectando a la base de datos...');
  const client = await pool.connect();
  console.log('✅ Conectado!');
  
  for (const sql of migrations) {
    try {
      console.log(`\n▶ Ejecutando: ${sql.substring(0, 60)}...`);
      await client.query(sql);
      console.log('  ✅ OK');
    } catch (err) {
      console.error(`  ❌ Error: ${err.message}`);
    }
  }
  
  // Verificar columnas existentes
  console.log('\n📋 Verificando estructura de tablas...');
  
  const usersCheck = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='users'
    ORDER BY column_name
  `);
  console.log('public.users columns:', usersCheck.rows.map(r => r.column_name).join(', '));
  
  const loansCheck = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='loans'
    ORDER BY column_name
  `);
  console.log('public.loans columns:', loansCheck.rows.map(r => r.column_name).join(', '));
  
  client.release();
  pool.end();
  console.log('\n✅ Migración completada!');
}

run().catch(e => {
  console.error('❌ Error fatal:', e.message);
  process.exit(1);
});
