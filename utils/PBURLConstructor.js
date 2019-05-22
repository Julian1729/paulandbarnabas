/**
 * PB URL Routes
 */
var URLConstructor = require('dynamic-url-constructor');

var constants = require('../config/constants');

var PBURLConstructor = new URLConstructor();
PBURLConstructor.setBase(constants.base_url);

/**
 * Page URLs
 */
// aka fragment overview
PBURLConstructor.addRoute('fragment-overview', '/territory/fragment/:fragment_id');
PBURLConstructor.addRoute('block-select', '/territory/fragment/:fragment_number/blocks');
PBURLConstructor.addRoute('block-overview', '/territory/fragment/:fragment_number/block/:block_id');
PBURLConstructor.addRoute('unit-overview', '/territory/fragment/:fragment_number/block/:block_id/unit/:unit_number');
PBURLConstructor.addRoute('unit-add-visit', '/territory/fragment/:fragment_number/block/:block_id/unit/:unit_number/householder-contacted');

/**
 * Rajax endpoints
 */
var rajaxBase = `/rajax/territory/street/:street_name/hundred/:hundred/unit/:unit_number`;
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

module.exports = PBURLConstructor;
