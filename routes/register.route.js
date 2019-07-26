const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const {registerController} = require(`${appRoot}/controllers`);

// Signup
router.get('/', (req, res, next) => {

  registerController.land(req, res, next);

});

module.exports = router;
