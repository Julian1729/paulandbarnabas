const express = require('express');
const router = express.Router();

const controller = require('../../controllers/Territory/Unit');

/**
 * Unit overview
 */
router.get('/', controller.overview);

module.exports = router;
