const db = require('../config/db');

exports.getOccurrencesByStation = async (req, res) => {
  const { stationId } = req.params;
  try {
    const result = await db.query(
      `SELECT o.*, u.name as user_name 
       FROM occurrences o 
       JOIN users u ON o.user_id = u.id 
       WHERE o.station_id = $1 
       ORDER BY o.created_at DESC`,
      [stationId]
    );
    res.json(result.rows ? result.rows : result);
  } catch (error) {
    console.error('Erro GET occurrences:', error.message);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

exports.addOccurrence = async (req, res) => {
  const { stationId } = req.params;
  const { description, latitude, longitude } = req.body;
  
  if (!req.user || !req.user.id) {
     return res.status(401).json({ error: 'Utilizador não autenticado.' });
  }
  
  if (!description) {
      return res.status(400).json({ error: 'A descrição é obrigatória.' });
  }

  try {
    // Confirma que a tabela se chama "occurrences" na tua Base de Dados
    const result = await db.query(
      'INSERT INTO occurrences (station_id, user_id, description, latitude, longitude) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [stationId, req.user.id, description, latitude, longitude]
    );
    res.status(201).json({ message: 'Ocorrência guardada com sucesso!', id: result.rows[0].id });
  } catch (error) {
    console.error('Erro POST occurrence:', error.message);
    res.status(500).json({ error: 'Erro de SQL: ' + error.message });
  }
};

exports.deleteOccurrence = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM occurrences WHERE id = $1', [id]);
    res.json({ message: 'Apagado com sucesso.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};