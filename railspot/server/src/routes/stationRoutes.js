const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');

// Rota para ver todas as estações
router.get('/', stationController.getAllStations);

// NOVA ROTA: Criar uma estação
router.post('/', stationController.createStation);

module.exports = router;