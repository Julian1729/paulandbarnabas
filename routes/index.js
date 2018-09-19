const express = require('express');
var router = express.Router();
var controller = require('../controllers/index');

router.get('/', (req, res, next) => {
  //res.render('index', {message: 'yeet '})
  controller.run(req, res, next);
});


module.exports = router;
