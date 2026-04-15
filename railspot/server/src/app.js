const express = require('express');
const cors = require('cors'); 
const app = express();

// Importar rotas
const stationRoutes = require('./routes/stationRoutes');
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const occurrenceRoutes = require('./routes/occurrenceRoutes');
const statsRoutes = require('./routes/statsRoutes');
const backupRoutes = require('./routes/backupRoutes');

// --- 🚨 MIDDLEWARE DE CORS CORRIGIDO ---
// Permite que o React (porta 5173) consiga enviar pedidos e tokens para o Express
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Adicionado OPTIONS por segurança para preflights
  // Adicionado 'x-auth-token' para permitir a passagem do token do frontend!
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'] 
}));

// Permite ao Express ler JSON no body
app.use(express.json());

// --- ROTAS ---
app.use('/api/stations', stationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/occurrences', occurrenceRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/backup', backupRoutes);

// Iniciar Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT} 🚀`);
});

module.exports = app;