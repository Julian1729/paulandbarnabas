const express = require('express');
var router = express.Router();
var controller = require('../controllers/Login');

// Landing Page
router.get('/', (req, res, next) => {
  //res.render('index', {message: 'yeet '})
  controller.run(req, res, next);
});

// Login
router.post('/', (req, res, next) => {
  //res.render('index', {message: 'yeet '})
  controller.run(req, res, next);
  //res.send(req.body)
});

module.exports = router;
