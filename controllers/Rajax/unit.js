/**
 * Rajax Unit Controller
 */
const HttpStatus = require('http-status-codes');

const logger = require('../../utils/logger');

var middleware = {};
var endpoints = {};

/**
 * Middleware
 */
middleware.findUnit = function(req, res, next){

  let unit_ref = req.body.unit_ref;
  if(req.app.locals.territory){
    console.log('lighweight baby');
  }

  // ensure unit ref is passed in
  if(!unit_ref){
    res.status(HttpStatus.BAD_REQUEST).send();
  }

};

module.exports = {middleware, endpoints};
