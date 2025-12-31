const express = require('express');
const cors = require('cors'); 
const app = express();

// Importar rotas
const stationRoutes = require('./routes/stationRoutes');
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

// --- MIDDLEWARE ---
app.use(cors()); // Desbloqueia o acesso do Frontend
app.use(express.json()); // Permite ler dados JSON

// --- ROTAS ---
app.use('/api/stations', stationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/schedules', scheduleRoutes);

// --- CORREÇÃO: INICIAR O SERVIDOR (Faltava isto!) ---
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor a correr na porta ${PORT} 🚀`);
});

module.exports = app;