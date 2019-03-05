/**
 * Fragment Controllers and Middleware;
 */

const HttpStatus = require('http-status-codes');
const _ = require('lodash');

const controllerBase = require('../base');
const TerritoryModel = require('../../models/Territory');
const UserModel = require('../../models/User');
const Session = require('../../session/session');
const constants = require('../../config/constants');
const errors = require('../../errors');
const Utils = require('../../utils/utils');

var middleware = {};
var endpoints = {};

/**
 * Middleware
 */

  middleware.findUserFragments = (req, res, next) => {

    let territory = req.app.locals.territory.territory;
    let assigned_fragments = territory.findUserFragments(req.app.locals.user.user_id);
    // attach fragments to locals
    req.app.locals.territory.assigned_fragments = assigned_fragments;
    return next();

  };

  middleware.findRequestedFragment = (req, res, next) => {

    if(!req.params.fragment_id) return next();


    let territory = req.app.locals.territory.territory;
    let assigned_fragments = req.app.locals.territory.assigned_fragments;

    var fragment = assigned_fragments.find(f => {
      return f._id.equals(req.params.fragment_id);
    });

    if(!fragment){
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }

    //init current
    req.app.locals.territory.current = {};
    req.app.locals.territory.current.fragment = fragment;

    return next();

  };

  middleware.findFragmentBlocks = (req, res, next) => {

    var territory = req.app.locals.territory.territory;
    let fragments = req.app.locals.territory.assigned_fragments;

    // init blank block map object
    let blocks = req.app.locals.territory.block_map = {};

    fragments.forEach(f => {
      blocks[f.number] = territory.findBlocksById(f.blocks);
    });

    let currentFragmentNumber = req.app.locals.territory.current.fragment.number;

    // reference requested fragment's assigned blocks as blocks
    req.app.locals.territory.current.blocks = blocks[currentFragmentNumber];

    return next();

  };

  middleware.findRequestedBlock = (req, res, next) => {

    let blockId = req.params.block_id;

    let block = req.app.locals.territory.current.blocks.find(b => {
      return b.block._id.equals(blockId);
    });

    req.app.locals.territory.current.block = block;

    return next();

  };


/**
 * Endpoint controllers
 */

  /**
   * Show fragment overview, blocks
   */
  endpoints.land = (req, res, next) => {

    // find requested fragment
    let fragment = req.app.locals.territory.current.fragment;
    let blocks = req.app.locals.territory.current.blocks;

    var renderVars = {
      // Oakland: {id: 'asdfasdf', blocks: {hundred: 4700, odd_even: 'even'}}
      fragment_id: fragment._id,
      // work_url: constants.fragment_url + "/work/" + fragment_id
      work_url: `${constants.fragment_url}/${fragment._id}/blocks/`,
      streets: {}
    };

    // organize blocks by street

    blocks.forEach(b => {
      if(!renderVars.streets[b.street]){
        renderVars.streets[b.street] = {
          blocks: []
        };
      }
      renderVars.streets[b.street].blocks.push({
        hundred: b.hundred,
        odd_even: b.odd_even,
      });
    });

    res.render('Fragment/Overview', renderVars);

  };

  /**
   * List Blocks
   */
  endpoints.blockSelect = (req, res, next) => {

    let blocks = req.app.locals.territory.current.blocks;

    // add url to each block obj
    blocks = blocks.map(b => {
      b.block.url = `${constants.fragment_url}/${req.params.fragment_id}/blocks/${b.block._id}`;
      return b;
    });

    let renderVars = {
      fragment_id: req.params.fragment_id,
      fragment_number: req.app.locals.territory.current.fragment.number,
      // e.g. {street: Oakland, hundred: 4500, odd_even: 'even', id: 'sskskd' }
      blocks: blocks
    };

    res.render('Fragment/BlockSelect', renderVars);

  };

  /**
   * List Units
   */
  endpoints.block = (req, res, next) => {

    let user = Session.pickUserCredentials(req.session);
    let current = req.app.locals.territory.current;
    let fragment = current.fragment;
    let block_ref = current.block;

    // construct url
    function unit_url(fragmentId, blockId, unitNumber){
      // /:fragment_id/blocks/:block_id/unit/:unit_number'
      return `${constants.fragment_url}/${fragmentId}/blocks/${blockId}/unit/${unitNumber}`
    }

    // insert unit urls into unit object
    block_ref.block.units.map(u => {
      u.url = unit_url(fragment._id, block_ref.block._id, u.number);
    });

    var renderVars = {
      fragment: {
        number: req.app.locals.territory.current.fragment.number,
      },
      block_ref,
    };

    res.render('Fragment/Block', renderVars);

  };

module.exports = {
  middleware,
  endpoints
};
