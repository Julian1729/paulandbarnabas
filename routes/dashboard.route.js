const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const {dashboardController} = require(`${appRoot}/controllers`);
const protected = require(`${appRoot}/middleware/protected`);

router.get('/', protected, (req, res, next) => {
  dashboardController.land(req, res, next);
});

module.exports = router;
