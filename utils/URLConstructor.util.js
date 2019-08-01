/**
 * PB URL Routes
 */
const appRoot = require('app-root-path');
var URLConstructor = require('dynamic-url-constructor');

var constants = require(`${appRoot}/config/constants`);

var PBURLConstructor = new URLConstructor();
PBURLConstructor.setBase(constants.base_url);

/**
 * Page URLs
 */
PBURLConstructor.addRoute('dashboard', '/dashboard');
// aka fragment overview
PBURLConstructor.addRoute('fragment-overview', '/fragment/:fragment_number');
PBURLConstructor.addRoute('block-overview', '/fragment/:fragment_number/:hundred/:street_name/:side');
PBURLConstructor.addRoute('unit-overview', '/fragment/:fragment_number/:unit_number/:street_name');
PBURLConstructor.addRoute('unit-add-visit', '/fragment/:fragment_number/:unit_number/:street_name/contacted');

/**
 * Ajax Unit endpoints
 */
let ajaxBase = `/ajax/territory/street/:street_name/hundred/:hundred/unit/:unit_number`;
// Tags
PBURLConstructor.addRoute('add-tag', `${ajaxBase}/tag/add`);
// FIXME: add remove-tag

// Notes
PBURLConstructor.addRoute('add-note', `${ajaxBase}/note/add`);
// FIXME: add remove-note

// Do Not Call
PBURLConstructor.addRoute('mark-dnc', `${ajaxBase}/meta?dnc=1`);
PBURLConstructor.addRoute('unmark-dnc', `${ajaxBase}/meta?dnc=0`);

// Is Called On
PBURLConstructor.addRoute('mark-calledon', `${ajaxBase}/meta/?calledon=1`);
PBURLConstructor.addRoute('unmark-calledon', `${ajaxBase}/meta/?calledon=0`);

// Add Householder
PBURLConstructor.addRoute('add-householder', `${ajaxBase}/householder/add`);

// Add Visit
PBURLConstructor.addRoute('add-visit', `${ajaxBase}/visit/add`);

module.exports = PBURLConstructor;
