const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const auth = require('../middleware/authMiddleware');

// Rota pública para listar os comentários/ocorrências de uma estação
router.get('/:stationId', reviewController.getReviewsByStation);

// Rota privada para adicionar um comentário (requer login/token válido)
router.post('/:stationId', auth, reviewController.addReview);

// Rota privada para apagar um comentário (opcional)
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;