const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const {dashboardController} = require(`${appRoot}/controllers`);

// FIXME: protect this route
router.get('/', (req, res, next) => {
  dashboardController.land(req, res, next);
});

module.exports = router;
