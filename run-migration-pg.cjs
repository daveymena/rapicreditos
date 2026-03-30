const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: '164.68.122.5',
  port: 5436,
  user: 'postgres',
  password: '6715320D',
  database: 'posgres-db',
  ssl: false,
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL EasyPanel');

    const sql = fs.readFileSync(path.join(__dirname, 'migration-to-postgres.sql'), 'utf8');
    
    // Ejecutar el SQL completo
    await client.query(sql);
    console.log('✅ Migración ejecutada exitosamente');

    // Verificar tablas creadas
    const res = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('\n📋 Tablas creadas:');
    res.rows.forEach(r => console.log('  -', r.table_name));

  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.detail) console.error('   Detalle:', err.detail);
  } finally {
    await client.end();
  }
}

run();
