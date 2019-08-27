const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const {registerController} = require(`${appRoot}/controllers`);
const {authenticationMiddleware} = require(`${appRoot}/middleware`);

router.all('/', authenticationMiddleware.loggedInRedirect);

// Signup
// router.get('/', registerController.land);

module.exports = router;
