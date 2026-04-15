const db = require('../config/db');

exports.getStats = async (req, res) => {
  try {
    console.log("--- 📊 A LER DADOS DIRETAMENTE ---");

    // Vamos buscar apenas as colunas de ID (super leve e rápido)
    // E deixamos o JavaScript fazer a contagem com o .length
    const usersData = await db.query('SELECT id FROM users');
    const stationsData = await db.query('SELECT id FROM stations');
    const reviewsData = await db.query('SELECT id FROM reviews');
    const occurrencesData = await db.query('SELECT id FROM occurrences');

    const finalData = {
      users: usersData.rows.length,
      stations: stationsData.rows.length,
      reviews: reviewsData.rows.length,
      occurrences: occurrencesData.rows.length
    };

    console.log("🔥 SUCESSO! Dados a enviar para o React:", finalData);
    
    res.json(finalData);

  } catch (error) {
    console.error('Erro fatal no statsController:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};