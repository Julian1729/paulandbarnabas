/**
 * Parent Territory Middlware
 */
const sprintf = require('sprintf-js').sprintf
const URLConstructor = require('dynamic-url-constructor');

const TerritoryModel = require('../../models/Territory');
const constants = require('../../config/constants');

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

  let PBURLConstructor = new URLConstructor();
  PBURLConstructor.setBase(constants.base_url);

  /**
   * Page URLs
   */
  // aka fragment overview
  PBURLConstructor.addRoute('block-select', '/territory/fragment/:fragment_id');
  PBURLConstructor.addRoute('block-overview', '/territory/fragment/:fragment_id/blocks/:block_id');
  PBURLConstructor.addRoute('unit-overview', '/territory/fragment/:fragment_id/blocks/:block_id/unit/:unit_number');
  PBURLConstructor.addRoute('unit-add-visit', '/territory/fragment/:fragment_id/blocks/:block_id/unit/:unit_number/householder-contacted');

  /**
   * Rajax endpoints
   */
  let rajaxBase = `/rajax/territory/street/:street_name/hundred/:hundred/unit/:unit_number`;
  // Tags
  PBURLConstructor.addRoute('add-tag', `${rajaxBase}/tag/add`);
  // FIXME: add remove-tag

  // Notes
  PBURLConstructor.addRoute('add-note', `${rajaxBase}/note/add`);
  // FIXME: add remove-note

  // Do Not Call
  PBURLConstructor.addRoute('mark-dnc', `${rajaxBase}/meta?dnc=1`);
  PBURLConstructor.addRoute('unmark-dnc', `${rajaxBase}/meta?dnc=0`);

  // Is Called On
  PBURLConstructor.addRoute('mark-calledon', `${rajaxBase}/meta/?calledon=1`);
  PBURLConstructor.addRoute('unmark-calledon', `${rajaxBase}/meta/?calledon=0`);

  // Add Householder
  PBURLConstructor.addRoute('add-householder', `${rajaxBase}/householder/add`);

  // Add Visit
  PBURLConstructor.addRoute('add-visit', `${rajaxBase}/visit/add`);

  res.locals.PBURLConstructor = PBURLConstructor;

  next();

};

// middleware.constructURLs = (req, res, next) => {
//
//   var territory_base_url = `${constants.base_url}/territory`;
//
//   let fragmentOverview = `${territory_base_url}/fragment/%1$s`;
//   let blockSelect = `${fragmentOverview}/blocks`;
//   let blockOverview = `${blockSelect}/%2$s`;
//   let unitOverview = `${blockOverview}/unit/%3$s`;
//
//   var URL_CONSTRUCTOR = {
//
//     // fragment overview
//     'block-select': (fragment_id) => sprintf(blockSelect, fragment_id),
//
//     // block overview
//     'block-overview': (fragment_id, block_id) => sprintf(blockOverview, fragment_id, block_id),
//
//     // unit overview w/ support for optional subunit
//     'unit-overview': (fragment_id, block_id, unit_number, subunit_name) => {
//
//       let url = sprintf(unitOverview, fragment_id, block_id, unit_number);
//
//       // if subunit name passed in, append to url
//       if(subunit_name){
//         url = `${url}?subunit=${encodeURIComponent(subunit_name)}`
//       };
//
//       return url;
//
//     },
//
//     'unit-add-visit': (unit_number, subunit_name) => (!subunit_name ? `./${unit_number}/householder-contacted` : `./${unit_number}/householder-contacted?subunit=${encodeURIComponent(subunit_name)}`)
//
//   };
//
//   // attach to locals
//   req.app.locals.URL_CONSTRUCTOR = URL_CONSTRUCTOR;
//
//   next();
//
//   // fragment work url -> block select page
//   // block work url -> block overview page
//   // unit overview url -> unit overview
//   // householder contacted url -> householder contacted
//   // options ->
//     // routes to send
//     // add tag...
//
// };

module.exports = {middleware, endpoints};
