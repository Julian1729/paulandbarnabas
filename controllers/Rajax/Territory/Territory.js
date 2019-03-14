/**
 * Parent Territory Rajax router
 */
const HttpStatus = require('http-status-codes');

const TerritoryModel = require('../../../models/Territory');

var middleware = {};

/**
 * Find the user's congregation's territory
 * and attach document to locals
 */
middleware.findUserTerritory = (req, res, next) => {

  if(!req.session.congregation){
    res.status(HttpStatus.UNAUTHORIZED).send();
  }

  TerritoryModel.findByCongregation(req.session.congregation)
    .then(territory => {
      req.app.locals.territory = {territory};
      // init current object
      req.app.locals.territory.current = {};
      next();
    })
    .catch(e => next(e));

};


module.exports = {middleware};
