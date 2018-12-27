const express = require('express');
const router = express.Router();

const controller = require('../controllers/Dashboard');
const protected = require('./middleware/protected');

router.get('/', protected, (req, res, next) => {
  controller.land(req, res, next);
});

module.exports = router;
