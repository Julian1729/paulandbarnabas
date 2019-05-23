const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const {loginController} = require(`${appRoot}/controllers`);

// Landing Page
router.get('/', (req, res, next) => {
  loginController.land(req, res, next);
});

module.exports = router;
