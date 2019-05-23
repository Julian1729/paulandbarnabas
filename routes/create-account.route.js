const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const {createAccountController} = require(`${appRoot}/controllers`);

// Signup
router.get('/', (req, res, next) => {

  createAccountController.land(req, res, next);

});

module.exports = router;
