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

  req.app.locals.territory.current.unit = unit;

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

  let renderVars = {
    fragment: {
      number: fragment.number
    },
    block_ref,
    unit
  };

  res.render('Fragment/Unit', renderVars);

};

module.exports = {endpoints, middleware};
