const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const {dashboardController} = require(`${appRoot}/controllers`);
const {territoryMiddleware, authenticationMiddleware} = require(`${appRoot}/middleware`);

router.use(authenticationMiddleware.devSessionAdmin, authenticationMiddleware.session, territoryMiddleware.findTerritory);

router.get('/', (req, res) => {
  dashboardController.land(req, res);
});

module.exports = router;
