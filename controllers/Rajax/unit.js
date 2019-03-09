/**
 * Rajax Unit Controller
 */
const HttpStatus = require('http-status-codes');

const logger = require('../../utils/logger');
const errors = require('../../errors');

var middleware = {};
var endpoints = {};

/**
 * Middleware
 */
middleware.findUnit = function(req, res, next){

  let territory = req.app.locals.territory.territory;
  // track down unit
  let reqStreet = req.params.street;
  let reqHundred = req.params.hundred;
  let reqUnit = req.params.unit;
  // store found here
  let street = null;
  let hundred = null;
  let unit = null;
  try {
    street = territory.findStreet(reqStreet);
    hundred = street.findHundred(reqHundred);
    unit = hundred.findUnit(reqUnit);
  } catch (e) {
    if(e instanceof errors.StreetNotFound || e instanceof errors.HundredNotFound || e instanceof errors.UnitNotFound){
      return res.status(HttpStatus.NOT_FOUND).send();
    }else{
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }

  next();

};

module.exports = {middleware, endpoints};
