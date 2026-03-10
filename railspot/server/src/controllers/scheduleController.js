const db = require('../config/db');

// Ler horários de uma estação
exports.getSchedulesByStation = async (req, res) => {
  const { stationId } = req.params;
  try {
    const query = 'SELECT * FROM schedules WHERE station_id = $1 ORDER BY departure_time ASC;';
    const { rows } = await db.query(query, [stationId]);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar horários:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};

// Adicionar um novo horário (Apenas Admin)
exports.addSchedule = async (req, res) => {
  const { stationId } = req.params;
  const { train_type, destination, departure_time } = req.body;

  try {
    const query = `
      INSERT INTO schedules (station_id, train_type, destination, departure_time)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await db.query(query, [stationId, train_type, destination, departure_time]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar horário:', error);
    res.status(500).json({ error: 'Erro ao guardar na base de dados.' });
  }
};

// Eliminar um horário (Apenas Admin)
exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'DELETE FROM schedules WHERE id = $1 RETURNING *;';
    const { rows } = await db.query(query, [id]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'Horário não encontrado.' });
    res.json({ message: 'Horário eliminado com sucesso!' });
  } catch (error) {
    console.error('Erro ao eliminar horário:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
};