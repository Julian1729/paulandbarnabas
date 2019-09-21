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
PBURLConstructor.addRoute('registration-congregation', '/register/congregation');
PBURLConstructor.addRoute('registration-user', '/register/user');
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
 * Ajax Territory
 */
let ajaxTerritoryBase = `/ajax/territory`

/**
 * Ajax Unit endpoints
 */
let ajaxUnitBase = `${ajaxTerritoryBase}/street/:street_name/hundred/:hundred/unit/:unit_number`;
// Tags
PBURLConstructor.addRoute('add-tag', `${ajaxUnitBase}/tag/add`);
// FIXME: add remove-tag

// Notes
PBURLConstructor.addRoute('add-note', `${ajaxUnitBase}/note/add`);
PBURLConstructor.addRoute('remove-note', `${ajaxUnitBase}/note/remove?id=:noteId`);
// FIXME: add remove-note

// Do Not Call
PBURLConstructor.addRoute('mark-dnc', `${ajaxUnitBase}/meta?dnc=1`);
PBURLConstructor.addRoute('unmark-dnc', `${ajaxUnitBase}/meta?dnc=0`);

// Is Called On
PBURLConstructor.addRoute('mark-calledon', `${ajaxUnitBase}/meta/?calledon=1`);
PBURLConstructor.addRoute('unmark-calledon', `${ajaxUnitBase}/meta/?calledon=0`);

// Add Householder
PBURLConstructor.addRoute('add-householder', `${ajaxUnitBase}/householder/add`);
PBURLConstructor.addRoute('remove-householder', `${ajaxUnitBase}/householder/remove?id=:householderId`);

// Add Visit
PBURLConstructor.addRoute('add-visit', `${ajaxUnitBase}/visit/add`);
PBURLConstructor.addRoute('remove-visit', `${ajaxUnitBase}/visit/remove?id=:visitId`);

/**
 * Ajax Account Endpoints
 */
PBURLConstructor.addRoute('user-registration', '/ajax/account/register/user');
PBURLConstructor.addRoute('congregation-registration', '/ajax/account/register/congregation');

/**
 * Ajax Territory Enpoints
 */
let ajaxBlockBase = `${ajaxTerritoryBase}/street/:street_name/hundred/:hundred/:side`;
PBURLConstructor.addRoute('block:add-tag', `${ajaxBlockBase}/tag/add`);
PBURLConstructor.addRoute('save-territory', `${ajaxTerritoryBase}/save-territory`);
PBURLConstructor.addRoute('save-fragment', `${ajaxTerritoryBase}/save-fragment`);
PBURLConstructor.addRoute('list-streets', `${ajaxTerritoryBase}/list/streets`);
PBURLConstructor.addRoute('list-fragments', `${ajaxTerritoryBase}/list/fragments`);
PBURLConstructor.addRoute('mark-block-worked', `${ajaxTerritoryBase}/street/:street_name/hundred/:hundred/:side/worked`);

PBURLConstructor.addRoute('street-stats', `${ajaxTerritoryBase}/street/:street_name/stats`);
PBURLConstructor.addRoute('fragment-stats', `${ajaxTerritoryBase}/fragment/:fragment_number/stats`);

module.exports = PBURLConstructor;
