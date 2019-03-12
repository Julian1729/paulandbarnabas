/**
 * Rajax Street Controller
 */
const HttpStatus = require('http-status-codes');

const logger = require('../../../../utils/logger');
const errors = require('../../../../errors');

let middleware = {};
let endpoints = {};

/**
 * Middleware
 */
middleware.findBlock = (req, res, next) =>{

  let territory = req.app.locals.territory;
  let reqBlock = req.params.side;
  // make sure that req.param.block equals "odd" or "even"
  if(!reqBlock || !(reqBlock === 'odd' || reqBlock === 'even')){
    logger.debug(`${reqBlock} must equal "odd" or "even"`);
    return res.status(HttpStatus.NOT_ACCEPTABLE).send();
  }
  let block = territory.current.hundred[reqBlock];
  // attach to locals
  territory.current.block = block;
  return next();
};

/**
 * Endpoints
 */


module.exports = {middleware, endpoints};
