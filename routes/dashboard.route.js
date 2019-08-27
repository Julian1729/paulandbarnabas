const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const {dashboardController} = require(`${appRoot}/controllers`);
const {territoryMiddleware, authenticationMiddleware} = require(`${appRoot}/middleware`);

router.use(authenticationMiddleware.devSessionAdmin, authenticationMiddleware.session, authenticationMiddleware.localizeSession, territoryMiddleware.findTerritory);

router.get('/', dashboardController.land);

module.exports = router;
