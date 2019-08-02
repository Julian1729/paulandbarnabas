const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

const {unitController} = require(`${appRoot}/controllers`);

// run middleware
router.all('*', unitController.middleware.findRequestedUnit);

/**
 * Unit overview
 */
router.get('/', unitController.endpoints.overview);

/**
 * Housholder contacted
 */
router.get('/householder-contacted', unitController.endpoints.householderContacted);

module.exports = router;
