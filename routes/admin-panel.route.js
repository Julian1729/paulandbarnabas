const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');
const {adminPanelController} = require(`${appRoot}/controllers`);

const {authenticationMiddleware, territoryMiddleware} = require(`${appRoot}/middleware`);

// Protect all Admin Panel routes
router.use(authenticationMiddleware.devSessionAdmin, authenticationMiddleware.session, authenticationMiddleware.admin, authenticationMiddleware.localizeSession, territoryMiddleware.findTerritory);

// Home
router.get('/', (req, res, next) => {

  adminPanelController.land(req, res, next);

});

// Create Territory
router.get('/create-territory', (req, res, next) => {

  adminPanelController.createTerritory(req, res, next);

});

// Create Fragment
router.get('/create-fragment', (req, res, next) => {

  adminPanelController.createFragment(req, res, next);

});

// Manage Publishers page
router.get('/manage-publishers', (req, res, next) => {

  adminPanelController.managePublishers(req, res, next);

});

module.exports = router;
