const express = require('express');
const router = express.Router();
const occurrenceController = require('../controllers/occurrenceController');
const auth = require('../middleware/authMiddleware');

router.get('/:stationId', occurrenceController.getOccurrencesByStation);
router.post('/:stationId', auth, occurrenceController.addOccurrence);
router.delete('/:id', auth, occurrenceController.deleteOccurrence);

module.exports = router;