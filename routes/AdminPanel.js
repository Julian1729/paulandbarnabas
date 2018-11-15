const express = require('express');
const router = express.Router();
const controller = require('../controllers/AdminPanel');

// Home
router.get('/', (req, res, next) => {

  controller.land(req, res, next);

});

// Create Territory
router.get('/createterritory', (req, res, next) => {
  controller.createTerritory(req, res, next);
});

module.exports = router;