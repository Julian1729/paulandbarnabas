/**
 * Unit Pages Controller
 */
const HttpStatus = require('http-status-codes');

const TerritoryModel = require('../../models/Territory');
const Session = require('../../session/session');
const errors = require('../../errors');
const Utils = require('../../utils/utils');

var middleware = {};
var endpoints = {};

/**
 * Middleware
 */
middleware.findRequestedUnit = (req, res, next) => {

  let unitNumber = req.params.unit_number;
  let block_ref = req.app.locals.territory.current.block;
  let unit = block_ref.block.unit(unitNumber);
  let subunitParam = req.query.subunit || null;

  // attach to locals
  req.app.locals.territory.current.unit = unit;

  // get subunit if "subunit" GET param
  if(subunitParam){
    // search for subunit in unit
    try {
      let subunit = unit.findSubunit(subunitParam);
      // attach to locals
      req.app.locals.territory.current.subunit = subunit;
    } catch (e) {
      // send 404 if subunit not found
      if(e instanceof errors.SubunitNotFound){
       return res.status(HttpStatus.NOT_FOUND).send();
      }
      // if not delegate to main error handler
      throw e;
    }
  }

  return next();

};

/**
 * Unit Overview
 */
endpoints.overview = (req, res, next) => {

  let user = Session.pickUserCredentials(req.session);
  let fragment = req.app.locals.territory.current.fragment;
  let block_ref = req.app.locals.territory.current.block;
  let unit = req.app.locals.territory.current.unit;
  let subunit = req.app.locals.territory.current.subunit || null;

  let renderVars = {
    fragment: {
      number: fragment.number
    },
    block_ref,
    unit,
    subunit
  };

  res.render('Fragment/Unit', renderVars);

};

module.exports = {endpoints, middleware};
