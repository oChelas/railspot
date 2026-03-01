const db = require('../config/db');

// 1. BUSCAR TODAS AS ESTAÇÕES (GET)
exports.getAllStations = async (req, res) => {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        description, 
        image_url, 
        ST_Y(location::geometry) as latitude, 
        ST_X(location::geometry) as longitude 
      FROM stations
    `;
    const { rows } = await db.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar estações:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// 2. CRIAR NOVA ESTAÇÃO (POST)
exports.createStation = async (req, res) => {
  const { name, description, image_url, latitude, longitude } = req.body;

  try {
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ error: 'Nome e Coordenadas são obrigatórios!' });
    }

    const query = `
      INSERT INTO stations (name, description, image_url, location)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($5, $4), 4326))
      RETURNING *;
    `;

    const values = [name, description, image_url, latitude, longitude];
    const { rows } = await db.query(query, values);
    
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao criar estação:', error);
    res.status(500).json({ error: 'Erro ao criar estação na base de dados.' });
  }
};

// 3. ATUALIZAR ESTAÇÃO (PUT)
exports.updateStation = async (req, res) => {
  const { id } = req.params;
  const { name, description, image_url, latitude, longitude } = req.body;

  try {
    const query = `
      UPDATE stations 
      SET 
        name = $1, 
        description = $2, 
        image_url = $3, 
        location = ST_SetSRID(ST_MakePoint($5, $4), 4326)
      WHERE id = $6
      RETURNING 
        id, 
        name, 
        description, 
        image_url, 
        ST_Y(location::geometry) as latitude, 
        ST_X(location::geometry) as longitude;
    `;

    const values = [name, description, image_url, latitude, longitude, id];
    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Estação não encontrada.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar estação:', error);
    res.status(500).json({ error: 'Erro ao atualizar estação na base de dados.' });
  }
};

// 4. ELIMINAR ESTAÇÃO (DELETE) - NOVA FUNÇÃO
exports.deleteStation = async (req, res) => {
  const { id } = req.params;

  try {
    // Apaga a estação e devolve a linha apagada para confirmação
    const query = 'DELETE FROM stations WHERE id = $1 RETURNING *';
    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Estação não encontrada ou já eliminada.' });
    }

    res.json({ message: 'Estação eliminada com sucesso!', station: rows[0] });
  } catch (error) {
    console.error('Erro ao eliminar estação:', error);
    res.status(500).json({ error: 'Erro ao eliminar estação na base de dados.' });
  }
};