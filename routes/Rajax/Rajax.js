/**
 * Rajax Controller
 * Routing ajax controller
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const HttpStatus = require('http-status-codes');

var loadedRouter = null;

router.use('/unit', require('./subrouters/unit'));

module.exports = router;
