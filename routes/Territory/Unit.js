const express = require('express');
const router = express.Router({mergeParams: true});

const controller = require('../../controllers/Territory/Unit');

// run middleware
router.all('*', controller.middleware.findRequestedUnit);

/**
 * Unit overview
 */
router.get('/', controller.endpoints.overview);

/**
 * Housholder contacted
 */
router.get('/householder-contacted', controller.endpoints.householderContacted);

module.exports = router;
