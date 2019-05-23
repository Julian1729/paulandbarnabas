const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const {adminPanelController} = require(`${appRoot}/controllers`);
const protected = require(`${appRoot}/middleware/protected`);

// Protect all Admin Panel routes
router.use(protected);

// Home
router.get('/', (req, res, next) => {

  adminPanelController.land(req, res, next);

});

// Create Territory
router.get('/createterritory', (req, res, next) => {
  adminPanelController.createTerritory(req, res, next);
});

// Create Fragment
router.get('/createfragment', (req, res, next) => {
  adminPanelController.createFragment(req, res, next);
});

// Manage Publishers page
router.get('/managepublishers', (req, res, next) => {
  adminPanelController.managePublishers(req, res, next);
});

module.exports = router;
