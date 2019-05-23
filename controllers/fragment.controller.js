/**
 * Fragment Controllers and Middleware;
 */
const _ = require('lodash');
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const errors = require(`${appRoot}/errors`);
const {logger} = require(`${appRoot}/utils`);
const {TerritoryModel, UserModel} = require(`${appRoot}/models`);

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

    if(!req.params.fragment_number) return next();

    let territory = res.locals.territory;
    let assigned_fragments = res.locals.user.assigned_fragments;

    var fragment = assigned_fragments.find(f => {
      return f.number === (req.params.fragment_number * 1);
    });

    // if fragment is not found in user assigned fragments,
    // the user in not authorized to view that fragment
    if(!fragment){
      logger.debug(`Fragment #${req.params.fragment_number} is not assigned to this user.`);
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }

    //init current object to hold currently requested assets
    res.locals.requested.fragment = fragment;

    let PBURLConstructor = res.locals.PBURLConstructor;

    // add fragment_id global
    PBURLConstructor.setGlobal('fragment_number', fragment.number);

    res.locals.render_vars.fragment = {
      number: fragment.number,
      id: fragment._id,
      overview_url: PBURLConstructor.getRoute('block-select').url()
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

    let PBURLConstructor = res.locals.PBURLConstructor;

    // add hundred, and streets as global
    PBURLConstructor.setGlobal('street_name', block.street);
    PBURLConstructor.setGlobal('hundred', block.hundred);
    PBURLConstructor.setGlobal('block_id', block.block._id.toString());

    let territory = res.locals.territory;
    // add block overview url to render_vars
    res.locals.render_vars.block.overview_url = PBURLConstructor.getRoute('block-overview').url();

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

    let blocks = res.locals.requested.blocks;

    let PBURLConstructor = res.locals.PBURLConstructor;

    // have following propertes street, hundred, odd_even, id, overview_url
    blocks = blocks.map(b => {
      return {
        street: b.street,
        hundred: b.hundred,
        odd_even: b.odd_even,
        id: b._id,
        overview_url: PBURLConstructor.getRoute('block-overview').url({block_id: b.block._id.toString()})
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

    let PBURLConstructor = res.locals.PBURLConstructor;
    // format array of units to have following properties
    // number, id, overview_url, subunits .. overview_url
    let formattedUnits = units.map(u => {
      let obj = {
        number: u.number,
        id: u._id,
        overview_url: PBURLConstructor.getRoute('unit-overview').url({unit_number: u.number}),
        subunits: [],
        visits: (u.visits.length) ? true : false,
        iscalledon: u.iscalledon,
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
            overview_url: PBURLConstructor.getRoute('unit-overview').url({'unit_number': u.number}, {'subunit': s.name}),
            visits: (s.visits.length) ? true : false,
            iscalledon: u.iscalledon,
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
