const express = require('express');
var router = express.Router();
var controller = require('../controllers/Login');

// Landing Page
router.get('/', (req, res, next) => {
  controller.land(req, res, next);
});

module.exports = router;
