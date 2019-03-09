/**
 * Unit Rajax Router
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const HttpStatus = require('http-status-codes');

const controller = require('../../../controllers/Rajax/unit')

router.all('/:street/:hundred/:unit', controller.middleware.findUnit, (req, res, next) => {

  res.send('from all');

});

/**
 * Test routes
 */

module.exports = router;
