const db = require('../config/db');

exports.getSchedules = async (req, res) => {
  const { stationId } = req.params;
  try {
    const query = `SELECT * FROM schedules WHERE station_id = $1 ORDER BY departure_time ASC`;
    const { rows } = await db.query(query, [stationId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Erro interno' });
  }
};