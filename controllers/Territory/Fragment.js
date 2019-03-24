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

  /**
   * Initialize render_vars object to be held and
   * updated throughout route journey on res.locals
   */
  middleware.initRenderVars = (req, res, next) => {

    res.locals.render_vars = {};

    next();

  };

  middleware.findUserFragments = (req, res, next) => {

    let territory = res.locals.territory;
    let assigned_fragments = territory.findUserFragments(req.session.user_id);
    // attach fragments to locals
    res.locals.user.assigned_fragments = assigned_fragments;
    return next();

  };

  middleware.findRequestedFragment = (req, res, next) => {

    if(!req.params.fragment_id) return next();

    let territory = res.locals.territory;
    let assigned_fragments = res.locals.user.assigned_fragments;

    var fragment = assigned_fragments.find(f => {
      return f._id.equals(req.params.fragment_id);
    });

    // if fragment is not found in user assigned fragments,
    // the user in not authorized to view that fragment
    if(!fragment){
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }

    //init current object to hold currently requested assets
    res.locals.requested.fragment = fragment;

    let URL_CONSTRUCTOR = req.app.locals.URL_CONSTRUCTOR;

    // ini fragment object on render_vars
    // attach number and work_url
    res.locals.render_vars.fragment = {
      number: fragment.number,
      id: fragment._id,
      overview_url: URL_CONSTRUCTOR['block-select'](fragment._id.toString())
    };

    return next();

  };

  middleware.findFragmentBlocks = (req, res, next) => {

    var territory = res.locals.territory;
    let fragments = res.locals.user.assigned_fragments;

    // init blank block map object
    let blocks = res.locals.territory.block_map = {};

    fragments.forEach(f => {
      blocks[f.number] = territory.findBlocksById(f.blocks);
    });

    let currentFragmentNumber = res.locals.requested.fragment.number;

    // reference requested fragment's assigned blocks as blocks
    res.locals.requested.blocks = blocks[currentFragmentNumber];

    return next();

  };

  middleware.findRequestedBlock = (req, res, next) => {

    let blockId = req.params.block_id;
    let requested = res.locals.requested;

    let block = requested.blocks.find(b => {
      return b.block._id.equals(blockId);
    });

    // attach to locals
    res.locals.requested.block = block;

    // attach block ref to render_vars
    res.locals.render_vars.block = _.pick(block, ['street', 'hundred', 'odd_even', '_id', 'block._id']);
    let URL_CONSTRUCTOR = req.app.locals.URL_CONSTRUCTOR;
    let territory = res.locals.territory;
    // add block overview url to render_vars
    res.locals.render_vars.block.overview_url = URL_CONSTRUCTOR['block-select'](requested.fragment._id.toString());

    return next();

  };


/**
 * Endpoint controllers
 */

  /**
   * Show fragment overview, blocks
   */
  endpoints.fragmentOverview = (req, res) => {

    // find requested fragment
    let fragment = res.locals.requested.fragment;
    let blocks = res.locals.requested.blocks;

    var renderVars = {
      // Oakland: {id: 'asdfasdf', blocks: {hundred: 4700, odd_even: 'even'}}
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

    res.render('Territory/FragmentOverview', renderVars);

  };

  /**
   * List Blocks
   */
  endpoints.blockSelect = (req, res) => {

    let requested = res.locals.requested;
    let URL_CONSTRUCTOR = req.app.locals.URL_CONSTRUCTOR;

    let blocks = res.locals.requested.blocks;

    // have following propertes street, hundred, odd_even, id, overview_url
    blocks = blocks.map(b => {
      return {
        street: b.street,
        hundred: b.hundred,
        odd_even: b.odd_even,
        id: b._id,
        overview_url: URL_CONSTRUCTOR['block-overview'](requested.fragment._id.toString(), b.block._id.toString())
      }
    });

    let renderVars = {
      blocks: blocks
    };

    res.render('Territory/BlockSelect', renderVars);

  };

  /**
   * List Units
   */
  endpoints.blockOverview = (req, res) => {

    let requested = res.locals.requested;
    let block = requested.block;
    let units = block.block.units;

    let URL_CONSTRUCTOR = req.app.locals.URL_CONSTRUCTOR;
    // format array of units to have following properties
    // number, id, overview_url, subunits .. overview_url
    let formattedUnits = units.map(u => {
      let obj = {
        number: u.number,
        id: u._id,
        overview_url: URL_CONSTRUCTOR['unit-overview'](requested.fragment._id.toString(), block.block._id.toString(), u.number),
        subunits: [],
        visits: (u.visits.length) ? true : false,
        isdonotcall: u.isdonotcall,
        tags: u.tags
      };
      // handle subunits
      if(u.subunits){
        // loop through subunits and gather subunit name, and construct overview url
        // and push into subunits array on unit object
        u.subunits.forEach(s => {
          var subunitObj = {
            name: s.name,
            overview_url: URL_CONSTRUCTOR['unit-overview'](requested.fragment._id.toString(), block.block._id.toString(), u.number, s.name),
            visits: (s.visits.length) ? true : false,
            isdonotcall: s.isdonotcall,
            tags: s.tags
          };
          obj.subunits.push(subunitObj);
        });
      }
      return obj;
    });

    var renderVars = {
      units: formattedUnits
    };

    res.render('Territory/BlockOverview', renderVars);

  };

module.exports = {
  middleware,
  endpoints
};
