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
      overview_url: PBURLConstructor.getRoute('block-overview').url({
        hundred: b.hundred,
        street_name: b.street,
        side: b.odd_even,
      }),
    });
  });

  res.render('Territory/FragmentOverview', renderVars);

};

/**
 * List Units
 */
exports.blockOverview = (req, res) => {};
