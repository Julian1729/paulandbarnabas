const express = require('express');
var router = express.Router();
// OPTIMIZE: Load conroller file based on route instead of having
// all ajax functions in one file
var controller = require('../controllers/ajax');

router.get('/ajax/:controller', (req, res, next) => {
  //res.render('index', {message: 'yeet '})
  var requestedController = req.params.controller;
  // check to make sure that the controller exists
  if(controller[requestedController] && controller[requestedController].run){
    controller[requestedController].run(req, res, next);
  }else{
    // OPTIMIZE: Add an error logger here only to be used in prod
    res.send({
      err: `"${requestedController}" not found`
    });
  }
});

module.exports = router;
