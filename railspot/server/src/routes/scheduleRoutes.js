const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const auth = require('../middleware/authMiddleware');

// Público: Qualquer um pode ver os horários
router.get('/:stationId', scheduleController.getSchedulesByStation);

// Privado: Só os administradores podem gerir os dados
router.post('/:stationId', auth, scheduleController.addSchedule);
router.delete('/:id', auth, scheduleController.deleteSchedule);

module.exports = router;