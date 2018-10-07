const express = require('express');
var router = express.Router();
// OPTIMIZE: Load conroller file based on route instead of having
// all ajax functions in one file
var controller = require('../controllers/ajax');

var findController = (req, res, next) => {
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
};

// var acivateController = (req, res, next) => {
//   var requestedController = req.params.controller;
//   // check to make sure that the controller exists
//   if(controller[requestedController] && controller[requestedController].run){
//     req.toValidate = controller[requestedController].validators;
//     next();
//   }else{
//     // OPTIMIZE: Add an error logger here only to be used in prod
//     res.send({
//       err: `"${requestedController}" not found`
//     });
//   }
// };


// OPTIMIZE: Add middleware that checks referrer is
// from paul and barnabas
router.get('/:controller', findController);
router.post('/:controller', findController);

module.exports = router;
