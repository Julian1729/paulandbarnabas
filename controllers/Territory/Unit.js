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


  // OPTIMIZE: this could be created only once, including subunit if applicable
  // create unit reference
  let unitObj = {
    ref: {
      street: block_ref.street,
      hundred: block_ref.hundred,
      odd_even: block_ref.odd_even,
      unit: unit.number,
    },
    unit
  };

  // attach to locals
  req.app.locals.territory.current.unit = unitObj;

  // get subunit if "subunit" GET param
  if(subunitParam){
    // search for subunit in unit
    try {
      let subunit = unit.findSubunit(subunitParam);
      // create subunit ref
      let subunitObj = {
        ref: {
          street: block_ref.street,
          hundred: block_ref.hundred,
          odd_even: block_ref.odd_even,
          unit: unit.number,
          subunit: subunit.name,
        },
        subunit
      };
      // attach to locals
      req.app.locals.territory.current.subunit = subunitObj;
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

/**
 * Householder Contacted
 */
endpoints.householderContacted = (req, res) => {

  // let territory = req.app.locals.territory;
  // let unit = territory.current.unit;
  //
  // let renderVars = {
  //   unit
  // };

  res.send('HOUSEHOLDER CONTACTED!')

};

module.exports = {endpoints, middleware};
