/**
 * Rajax Street Controller
 */
const HttpStatus = require('http-status-codes');
const appRoot = require('app-root-path');

const logger = require(`${appRoot}/utils/logger`);
const errors = require(`${appRoot}/errors`);

var middleware = {};
var endpoints = {};

/**
 * Middlware
 */
// FIXME: CONFIGURE!
middleware.findStreet = (req, res, next) => {

  let territory = req.app.locals.territory;
  let street = null;
  try{
    street = territory.territory.findStreet(req.params.street_name);
    territory.current.street = street;
    logger.debug(`Street ${req.params.street_name} found`);
  }catch(e){
    if(e instanceof errors.StreetNotFound){
      console.log(e.stack);
      return res.status(HttpStatus.NOT_FOUND).send();
    }
    console.log(e.stack);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
  }
  return next();

};

/**
 * Endpoints
 */
// FIXME: not configured
// endpoints.removeStreet = (req, res, next) => {
//
//
//
// };


module.exports = {middleware, endpoints};
