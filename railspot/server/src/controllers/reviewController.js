const db = require('../config/db');

exports.getReviewsByStation = async (req, res) => {
  const { stationId } = req.params;
  try {
    const result = await db.query(
      `SELECT r.*, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.station_id = $1 
       ORDER BY r.created_at DESC`,
      [stationId]
    );
    res.json(result.rows ? result.rows : result);
  } catch (error) {
    console.error('Erro ao buscar reviews:', error.message);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

exports.addReview = async (req, res) => {
  const { stationId } = req.params;
  const { content } = req.body; 
  
  if (!req.user || !req.user.id) {
     return res.status(401).json({ error: 'Utilizador não autenticado.' });
  }
  const userId = req.user.id;

  if (!content || content.trim() === '') {
    return res.status(400).json({ error: 'O comentário não pode estar vazio.' });
  }

  try {
    // 1. Inserir a review na base de dados
    const result = await db.query(
      'INSERT INTO reviews (station_id, user_id, content) VALUES ($1, $2, $3) RETURNING id',
      [stationId, userId, content]
    );
    
    const insertId = result.rows && result.rows.length > 0 ? result.rows[0].id : null;
    
    // 2. IR BUSCAR O NOME EXATO DO UTILIZADOR À BASE DE DADOS
    const userResult = await db.query('SELECT name FROM users WHERE id = $1', [userId]);
    const userName = userResult.rows && userResult.rows.length > 0 ? userResult.rows[0].name : 'Utilizador';

    // 3. Devolver a review com o nome incluído (para o React desenhar bonito)
    res.status(201).json({ 
      id: insertId,
      station_id: stationId,
      user_id: userId,
      content: content,
      user_name: userName // <--- O NOME VEM DAQUI AGORA!
    });
  } catch (error) {
    console.error('\n--- 🚨 ERRO SQL AO ADICIONAR COMENTÁRIO ---');
    console.error('Mensagem de Erro:', error.message);
    res.status(500).json({ error: 'Erro ao guardar na BD: ' + error.message });
  }
};

exports.deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM reviews WHERE id = $1', [id]);
    res.json({ message: 'Comentário apagado com sucesso.' });
  } catch (error) {
    console.error('Erro ao apagar comentário:', error.message);
    res.status(500).json({ error: 'Erro ao apagar comentário.' });
  }
};