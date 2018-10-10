const express = require('express');
const router = express.Router();
const controller = require('../controllers/Dashboard');

router.get('/', (req, res, next) => {
  controller.land(req, res, next);
});

module.exports = router;
