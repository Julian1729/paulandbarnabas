const express = require('express');
const router = express.Router({mergeParams: true});

const controller = require('../../controllers/Territory/Unit');

// run middleware
router.all('/:unit_number*', controller.middleware.findRequestedUnit);

/**
 * Unit overview
 */
router.get('/:unit_number', controller.endpoints.overview);

module.exports = router;
