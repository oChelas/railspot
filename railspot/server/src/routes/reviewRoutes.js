const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

// Qualquer pessoa pode LER
router.get('/:stationId', reviewController.getReviewsByStation);

// Só quem tem login (auth) pode ESCREVER
router.post('/:stationId', auth, reviewController.addReview);

module.exports = router;