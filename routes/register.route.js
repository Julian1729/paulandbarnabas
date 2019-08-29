const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const {registrationController} = require(`${appRoot}/controllers`);
const {authenticationMiddleware} = require(`${appRoot}/middleware`);

router.all('/', authenticationMiddleware.loggedInRedirect);

// Register User
router.get('/user', registrationController.user);

module.exports = router;
