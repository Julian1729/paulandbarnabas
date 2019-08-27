const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const {loginController} = require(`${appRoot}/controllers`);
const {authenticationMiddleware} = require(`${appRoot}/middleware`);

router.all('/', authenticationMiddleware.loggedInRedirect);

// Landing Page
router.get('/', loginController.land);

module.exports = router;
