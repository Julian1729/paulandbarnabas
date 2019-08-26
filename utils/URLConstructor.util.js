/**
 * PB URL Routes
 * OPTIMIZE: organize this file and split up
 * constructors by category, ajax etc
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
PBURLConstructor.addRoute('logout', '/?logout=true');
// aka fragment overview
PBURLConstructor.addRoute('fragment-overview', '/fragment/:fragment_number');
PBURLConstructor.addRoute('block-overview', '/fragment/:fragment_number/:hundred/:street_name/:side');
PBURLConstructor.addRoute('unit-overview', '/fragment/:fragment_number/:unit_number/:street_name');
PBURLConstructor.addRoute('unit-add-visit', '/fragment/:fragment_number/:unit_number/:street_name/contacted');

// Admin Panel
PBURLConstructor.addRoute('admin-panel', '/admin-panel');
PBURLConstructor.addRoute('create-territory', '/admin-panel/create-territory');
PBURLConstructor.addRoute('create-fragment', '/admin-panel/create-fragment');
PBURLConstructor.addRoute('manage-publishers', '/admin-panel/manage-publishers');

/**
 * Ajax Unit endpoints
 */
let ajaxTerritoryBase = `/ajax/territory`
let ajaxUnitBase = `${ajaxTerritoryBase}/street/:street_name/hundred/:hundred/unit/:unit_number`;
// Tags
PBURLConstructor.addRoute('add-tag', `${ajaxUnitBase}/tag/add`);
// FIXME: add remove-tag

// Notes
PBURLConstructor.addRoute('add-note', `${ajaxUnitBase}/note/add`);
// FIXME: add remove-note

// Do Not Call
PBURLConstructor.addRoute('mark-dnc', `${ajaxUnitBase}/meta?dnc=1`);
PBURLConstructor.addRoute('unmark-dnc', `${ajaxUnitBase}/meta?dnc=0`);

// Is Called On
PBURLConstructor.addRoute('mark-calledon', `${ajaxUnitBase}/meta/?calledon=1`);
PBURLConstructor.addRoute('unmark-calledon', `${ajaxUnitBase}/meta/?calledon=0`);

// Add Householder
PBURLConstructor.addRoute('add-householder', `${ajaxUnitBase}/householder/add`);

// Add Visit
PBURLConstructor.addRoute('add-visit', `${ajaxUnitBase}/visit/add`);

/**
 * Ajax Enpoints
 */
PBURLConstructor.addRoute('save-territory', `${ajaxTerritoryBase}/save-territory`);
PBURLConstructor.addRoute('save-fragment', `${ajaxTerritoryBase}/save-fragment`);
PBURLConstructor.addRoute('list-streets', `${ajaxTerritoryBase}/list/streets`);
PBURLConstructor.addRoute('list-fragments', `${ajaxTerritoryBase}/list/fragments`);

PBURLConstructor.addRoute('street-stats', `${ajaxTerritoryBase}/street/:street_name/stats`);
PBURLConstructor.addRoute('fragment-stats', `${ajaxTerritoryBase}/fragment/:fragment_number/stats`);

module.exports = PBURLConstructor;
