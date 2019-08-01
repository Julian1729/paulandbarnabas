/**
 * Fragment Controllers and Middleware;
 */
const _ = require('lodash');
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const errors = require(`${appRoot}/errors`);
const {logger, PBURLConstructor} = require(`${appRoot}/utils`);
const {TerritoryModel, UserModel} = require(`${appRoot}/models`);

/**
 * Show fragment overview, blocks
 */
exports.fragmentOverview = (req, res) => {

  // find requested fragment
  let fragment = res.locals.collected.fragment;
  let blockReferences = res.locals.collected.fragmentBlockReferences;

  let renderVars = {
    // Oakland: {id: 'asdfasdf', blocks: {hundred: 4700, odd_even: 'even'}}
    streets: {}
  };

  let blockOverViewRoute = PBURLConstructor.getRoute('block-overview');
  // set fragment number as route param for all routes
  blockOverViewRoute.setParam('fragment_number', fragment.number);

  // organize blocks by street
  blockReferences.forEach(b => {
    if(!renderVars.streets[b.street]){
      renderVars.streets[b.street] = {
        blocks: []
      };
    }
    renderVars.streets[b.street].blocks.push({
      hundred: b.hundred,
      odd_even: b.odd_even,
      tags: b.block.tags,
      overview_url: blockOverViewRoute.url({
        hundred: b.hundred,
        street_name: b.street,
        side: b.odd_even,
      }),
    });
  });

  return res.render('Territory/FragmentOverview', renderVars);

};

/**
 * List units for user selection
 */
exports.blockOverview = (req, res) => {

  let requestedHundred = req.params.hundred * 1; // cast to Number
  let requestedStreet = req.params.street_name;
  let requestedSide = req.params.side;

  let fragmentNumber = res.locals.collected.fragment.number;
  let fragmentBlocks = res.locals.collected.fragmentBlockReferences;

  // search for block in fragment blocks
  // with matching hundred, street, and side
  let block = _.find(fragmentBlocks, {hundred: requestedHundred, street: requestedStreet, odd_even: requestedSide});
  if(!block){
    logger.verbose(`${requestedHundred} ${requestedStreet} ${requestedSide} not found in fragment #${res.locals.collected.fragment.number}`);
    // OPTIMIZE: send UI communicable error, let user
    // know that this block is not assigned to this fragment
    return res.status(HttpStatus.UNAUTHORIZED).send();
  }

  let units = block.block.units;

  // begin route construction with fragment number
  let unitOverviewRoute = PBURLConstructor.getRoute('unit-overview');
  unitOverviewRoute.setParam('fragment_number', fragmentNumber);

  let formattedUnits = units.map(u => {

    // construct overview url
    unitOverviewRoute.setParam('unit_number', u.number);
    unitOverviewRoute.setParam('street_name', block.street);

    let obj = {
      number: u.number,
      id: u._id,
      overview_url: unitOverviewRoute.url(),
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
        let subunitObj = {
          name: s.name,
          overview_url: unitOverviewRoute.url(null, {subunit: s.name}),
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

  let renderVars = {
    block: {
      hundred: block.hundred,
      side: block.odd_even,
      street: block.street,
      tags: block.block.tags,
    },
    units: formattedUnits,
  };

  return res.render('Territory/BlockOverview', renderVars);

};
