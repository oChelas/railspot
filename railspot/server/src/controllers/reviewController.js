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
  const { comment } = req.body; // <-- Confirma que o React envia o JSON com "comment"
  
  if (!req.user || !req.user.id) {
     return res.status(401).json({ error: 'Utilizador não autenticado.' });
  }
  const userId = req.user.id;

  if (!comment || comment.trim() === '') {
    return res.status(400).json({ error: 'O comentário/ocorrência não pode estar vazio.' });
  }

  try {
    // ATENÇÃO: Confirma se as colunas na tua tabela se chamam mesmo station_id, user_id e comment
    const result = await db.query(
      'INSERT INTO reviews (station_id, user_id, comment) VALUES ($1, $2, $3) RETURNING id',
      [stationId, userId, comment]
    );
    
    const insertId = result.rows && result.rows.length > 0 ? result.rows[0].id : null;
    
    res.status(201).json({ 
      message: 'Ocorrência adicionada com sucesso!',
      review: {
        id: insertId,
        station_id: stationId,
        user_id: userId,
        comment: comment
      }
    });
  } catch (error) {
    // DEBUG AVANÇADO PARA DESCOBRIR O ERRO EXATO
    console.error('\n--- 🚨 ERRO SQL AO ADICIONAR OCORRÊNCIA ---');
    console.error('Mensagem de Erro:', error.message);
    console.error('Detalhe do Postgres:', error.detail);
    console.error('Tabela a falhar:', error.table);
    console.error('-------------------------------------------\n');
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