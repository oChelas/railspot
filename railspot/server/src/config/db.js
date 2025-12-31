const { Pool } = require('pg');
require('dotenv').config();

// Cria a "piscina" (Pool) de conexões usando os dados do .env
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// Avisa no terminal quando conseguir ligar
pool.on('connect', () => {
  console.log('✅ Base de Dados (RailSpot) conectada com sucesso!');
});

// Avisa se houver erro
pool.on('error', (err) => {
  console.error('❌ Erro inesperado na Base de Dados', err);
  process.exit(-1);
});

// Exporta para podermos usar noutros ficheiros
module.exports = {
  query: (text, params) => pool.query(text, params),
};