/**
 * Master router for AJAX requests
 */
const express = require('express');
const router = express.Router({mergeParams: true});

// router.use('/territory', require('./territory'));

router.use('/account', require('./account'));

router.use('/users', require('./users'));

router.use('/territory', require('./territory'));

module.exports = router;
