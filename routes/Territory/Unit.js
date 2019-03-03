const express = require('express');
const router = express.Router({mergeParams: true});

const controller = require('../../controllers/Territory/Unit');

/**
 * Unit overview
 */
router.get('/:unit_number', controller.overview);

module.exports = router;
