const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const auth = require('../middleware/authMiddleware');

// Rota pública para ler os horários de uma estação
router.get('/:stationId', scheduleController.getSchedulesByStation);

// Rota privada para adicionar um horário a uma estação (requer login/token válido)
router.post('/:stationId', auth, scheduleController.addSchedule);

// Rota privada para apagar um horário
router.delete('/:id', auth, scheduleController.deleteSchedule);

module.exports = router;