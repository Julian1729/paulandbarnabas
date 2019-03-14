/**
 * Rajax Unit Controller
 */
const HttpStatus = require('http-status-codes');

const logger = require('../../../../utils/logger');
const errors = require('../../../../errors');

var middleware = {};
var endpoints = {};

/**
 * Middleware
 */
middleware.findUnit = function(req, res, next){

  let territory = req.app.locals.territory;
  let hundred = territory.current.hundred;

  let reqUnit = req.params.unit_number;

  let unit = null;

  try {
    unit = hundred.findUnit(reqUnit);
  } catch (e) {
    if(e instanceof errors.UnitNotFound){
      return res.status(HttpStatus.NOT_FOUND).send();
    }else{
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  // attach to locals
  territory.current.unit = unit;

  return next();

};

module.exports = {middleware, endpoints};
