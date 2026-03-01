const express = require('express');
const router = express.Router();
const stationController = require('../controllers/stationController');
const auth = require('../middleware/authMiddleware'); 

router.get('/', stationController.getAllStations);
router.post('/', stationController.createStation);
router.put('/:id', auth, stationController.updateStation);

// NOVA ROTA: Eliminar uma estação (Protegida pelo auth)
router.delete('/:id', auth, stationController.deleteStation);

module.exports = router;