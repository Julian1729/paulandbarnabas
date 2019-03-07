/**
 * Unit Rajax Controller
 *
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const HttpStatus = require('http-status-codes');

router.get('/:unit_id*', (req, res, next) => {

  res.send();

});

module.exports = router;
