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

// 2. CRIAR NOVA ESTAÇÃO (POST) - NOVA FUNÇÃO
exports.createStation = async (req, res) => {
  const { name, description, image_url, latitude, longitude } = req.body;

  try {
    // Validação simples
    if (!name || !latitude || !longitude) {
      return res.status(400).json({ error: 'Nome e Coordenadas são obrigatórios!' });
    }

    // Query de Inserção com PostGIS
    // Nota: ST_MakePoint recebe (Longitude, Latitude) nessa ordem
    const query = `
      INSERT INTO stations (name, description, image_url, location)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($5, $4), 4326))
      RETURNING *;
    `;

    const values = [name, description, image_url, latitude, longitude];
    
    const { rows } = await db.query(query, values);
    
    // Retorna a estação criada
    res.status(201).json(rows[0]);

  } catch (error) {
    console.error('Erro ao criar estação:', error);
    res.status(500).json({ error: 'Erro ao criar estação na base de dados.' });
  }
};