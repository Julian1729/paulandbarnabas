/**
 * Unit Rajax Router
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const HttpStatus = require('http-status-codes');

const controller = require('../../../controllers/Rajax/unit')

router.all('/:unit_id*', controller.middleware.findUnit, (req, res, next) => {

  res.send();

});

module.exports = router;
