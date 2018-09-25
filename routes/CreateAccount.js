const express = require('express');
const router = express.Router();
const controller = require('../controllers/CreateAccount');

// Signup
router.get('/', (req, res, next) => {

  controller.land(req, res, next);

});

module.exports = router;
