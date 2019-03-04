/**
 * Parent Territory Middlware
 */
const TerritoryModel = require('../../models/Territory');

var middleware = {};
var endpoints = {};

/**
 * Find the user's congregation's territory
 * and attach document to locals
 */
middleware.findUserTerritory = (req, res, next) => {

  TerritoryModel.findByCongregation(req.session.congregation)
    .then(territory => {
      req.app.locals.territory = {territory};
      return next();
    })
    .catch(e => next(e));

};

module.exports = {middleware, endpoints};
