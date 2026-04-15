const express = require('express');
const router = express.Router();
const { exportBackup } = require('../controllers/backupController');

// Quando acederem a esta rota, descarrega o ficheiro
router.get('/', exportBackup);

module.exports = router;