const appRoot = require('app-root-path');
const _ = require('lodash');

const {TerritoryModel} = require(`${appRoot}/models`);
const {PBURLConstructor} = require(`${appRoot}/utils`);

var middleware = {};
var endpoints = {};

/**
 * Initialize and default res.locals obj
 * that will consist of the assets that have
 * been collected throughout the route's path
 */
middleware.initAssetCollection = (req, res, next) => {

  // user territory object
  res.locals.territory = null;

  // requested assets
  // res.locals.requested = null;
  _.defaults(res.locals, {
    requested: {
      fragment: null,
      blocks: null,
      block: null,
      unit: null,
      subunit: null,
    }
  });

  // collected user assets
  _.defaults(res.locals.user,
    // OPTIMIZE: should this stored in user session
    //  rather than in request locals??
    {
      assigned_fragments: null
    });

  return next();

};

/**
 * Find the user's congregation's territory
 * and attach document to locals
 */
middleware.findUserTerritory = (req, res, next) => {

  TerritoryModel.findByCongregation(req.session.congregation)
    .then(territory => {
      // attach territory to res.locals
      res.locals.territory = territory;
      return next();
    })
    .catch(e => next(e));

};

middleware.constructURLs = (req, res, next) => {

  res.locals.PBURLConstructor = PBURLConstructor;

  next();

};

module.exports = {middleware, endpoints};
