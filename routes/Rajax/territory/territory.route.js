const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const {territoryController} = require(`${appRoot}/controllers/ajax/territory/index`);
const streetRoute = require('./street.route.js');

router.use(territoryController.middleware.findUserTerritory);

router.use('/street/:street_name', streetRoute);

module.exports = router;
