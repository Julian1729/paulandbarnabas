/**
 * Rajax Controller
 * Routing ajax controller
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const HttpStatus = require('http-status-codes');

router.use('/territory', require('./subrouters/Territory'));

module.exports = router;