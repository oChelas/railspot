const db = require('../config/db');

// Listar comentários de uma estação
exports.getReviewsByStation = async (req, res) => {
  const { stationId } = req.params;
  try {
    const query = `
      SELECT r.id, r.content, r.created_at, u.name as user_name 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.station_id = $1
      ORDER BY r.created_at DESC;
    `;
    const { rows } = await db.query(query, [stationId]);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

// Adicionar um comentário (Só para utilizadores autenticados)
exports.addReview = async (req, res) => {
  const { stationId } = req.params;
  const { content } = req.body;
  const userId = req.user.id; // Vem do token de autenticação

  try {
    const query = `
      INSERT INTO reviews (user_id, station_id, content)
      VALUES ($1, $2, $3)
      RETURNING id, content, created_at;
    `;
    const { rows } = await db.query(query, [userId, stationId, content]);
    
    // Devolvemos o comentário já com o nome do utilizador para aparecer logo
    res.json({ ...rows[0], user_name: req.user.name });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};