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
  
  // 1. Recebemos as variáveis em camelCase (formato em que o React envia no req.body)
  const { departureTime, destination, trainType } = req.body;

  // 2. Validação usando as variáveis corretas
  if (!departureTime || !destination) {
    return res.status(400).json({ error: 'Preenche a Hora e o Destino.' });
  }

  try {
    // 3. Injeção segura na Query SQL (colunas em snake_case, valores vindos do camelCase)
    const result = await db.query(
      'INSERT INTO schedules (station_id, departure_time, destination, train_type) VALUES ($1, $2, $3, $4) RETURNING id',
      [stationId, departureTime, destination, trainType || 'Urbano']
    );

    const insertId = result.rows && result.rows.length > 0 ? result.rows[0].id : null;

    // 4. Devolvemos a resposta confirmando a inserção
    res.status(201).json({ 
      message: 'Horário adicionado com sucesso!',
      schedule: {
        id: insertId,
        station_id: stationId,
        departure_time: departureTime,
        destination: destination,
        train_type: trainType || 'Urbano'
      }
    });
  } catch (error) {
    console.error('\n--- 🚨 ERRO FATAL AO ADICIONAR HORÁRIO NA BASE DE DADOS ---');
    console.error('Mensagem de Erro:', error.message);
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