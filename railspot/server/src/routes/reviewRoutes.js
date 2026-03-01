const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

// Qualquer pessoa pode LER
router.get('/:stationId', reviewController.getReviewsByStation);

// Só quem tem login (auth) pode ESCREVER
router.post('/:stationId', auth, reviewController.addReview);

// NOVA ROTA: Administradores podem ELIMINAR (Protegido por auth)
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;