const db = require('../config/db');

exports.getSchedulesByStation = async (req, res) => {
  const { stationId } = req.params;
  try {
    const result = await db.query(
      'SELECT * FROM schedules WHERE station_id = $1 ORDER BY departure_time ASC',
      [stationId]
    );
    res.json(result.rows ? result.rows : result);
  } catch (error) {
    console.error('Erro ao buscar horários:', error.message);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

exports.addSchedule = async (req, res) => {
  const { stationId } = req.params;
  const { departure_time, destination, line, train_type } = req.body;

  if (!departure_time || !destination || !line) {
    return res.status(400).json({ error: 'Preenche todos os campos obrigatórios.' });
  }

  try {
    // ATENÇÃO: Confirma se as tuas colunas se chamam departure_time, destination, line, train_type
    const result = await db.query(
      'INSERT INTO schedules (station_id, departure_time, destination, line, train_type) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [stationId, departure_time, destination, line, train_type || 'Urbano']
    );

    const insertId = result.rows && result.rows.length > 0 ? result.rows[0].id : null;

    res.status(201).json({ 
      message: 'Horário adicionado com sucesso!',
      schedule: {
        id: insertId,
        station_id: stationId,
        departure_time,
        destination,
        line,
        train_type: train_type || 'Urbano'
      }
    });
  } catch (error) {
    // DEBUG AVANÇADO PARA DESCOBRIR O ERRO EXATO
    console.error('\n--- 🚨 ERRO SQL AO ADICIONAR HORÁRIO ---');
    console.error('Mensagem de Erro:', error.message);
    console.error('Detalhe do Postgres:', error.detail);
    console.error('Tabela a falhar:', error.table);
    console.error('----------------------------------------\n');
    res.status(500).json({ error: 'Erro ao guardar na BD: ' + error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM schedules WHERE id = $1', [id]);
    res.json({ message: 'Horário apagado com sucesso.' });
  } catch (error) {
    console.error('Erro ao apagar horário:', error.message);
    res.status(500).json({ error: 'Erro ao apagar horário.' });
  }
};