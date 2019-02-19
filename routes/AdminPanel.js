const express = require('express');
const router = express.Router();

const controller = require('../controllers/AdminPanel');
const protected = require('./middleware/protected');

// Protect all Admin Panel routes
router.use(protected);

// Home
router.get('/', (req, res, next) => {

  controller.land(req, res, next);

});

// Create Territory
router.get('/createterritory', protected, (req, res, next) => {
  controller.createTerritory(req, res, next);
});

// Create Fragment
router.get('/createfragment', (req, res, next) => {
  controller.createFragment(req, res, next);
});

// Manage Publishers page
router.get('/managepublishers', (req, res, next) => {
  controller.managePublishers(req, res, next);
});

module.exports = router;
