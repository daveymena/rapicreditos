const pg = require('pg');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

/**
 * MIGRACIÓN AUTOMÁTICA PARA EASYPANEL
 * Este script prepara tu base de datos PostgreSQL local/interna
 * creando el esquema de compatibilidad con Supabase y cargando las tablas.
 */

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL no encontrada en las variables de entorno.');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: connectionString,
});

async function migrate() {
  console.log('🚀 Iniciando migración a PostgreSQL en EasyPanel...');

  try {
    // 1. Crear esquema de compatibilidad 'auth' (para emular Supabase)
    console.log('📦 Creando esquema de compatibilidad auth...');
    await pool.query(`
      CREATE SCHEMA IF NOT EXISTS auth;
      
      -- Emular función auth.uid() para RLS si existe el campo user_id
      CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
      BEGIN
        RETURN (current_setting('request.jwt.claims', true)::json->>'sub')::uuid;
      EXCEPTION WHEN OTHERS THEN
        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // 2. Cargar SCHEMA_COMPLETO.sql
    console.log('📄 Cargando esquema de base de datos (SCHEMA_COMPLETO.sql)...');
    if (fs.existsSync('SCHEMA_COMPLETO.sql')) {
      const sql = fs.readFileSync('SCHEMA_COMPLETO.sql', 'utf8');
      
      // Dividir el SQL por punto y coma para ejecutar sentencias individualmente (opcional pero más seguro)
      // O bien, ejecutar todo en una sola transacción
      await pool.query('BEGIN');
      try {
        await pool.query(sql);
        await pool.query('COMMIT');
        console.log('✅ Tablas y relaciones creadas exitosamente.');
      } catch (e) {
        await pool.query('ROLLBACK');
        console.error('❌ Error ejecutando SCHEMA_COMPLETO:', e.message);
      }
    } else {
      console.warn('⚠️ No se encontró SCHEMA_COMPLETO.sql. Saltando este paso.');
    }

    // 3. Verificación final
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('📊 Tablas en la base de datos:', res.rows.map(r => r.table_name).join(', '));

    console.log('🎉 Migración completada. Tu sistema ya puede usar PostgreSQL.');

  } catch (err) {
    console.error('💥 Error crítico durante la migración:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
