/**
 * Gateway router for /territory
 */
const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

const {territoryController} = require(`${appRoot}/ajax/controllers/territory`);
const {territoryMiddleware, authenticationMiddleware} = require(`${appRoot}/middleware`);

router.use(authenticationMiddleware.session, territoryMiddleware.findTerritory);

// find and load street on routes with :street_name
router.param('street_name', territoryMiddleware.findRequestedStreet);

// find and load hundred on routes with :hundred
router.param('hundred', territoryMiddleware.findRequestedHundred);

// find and load block (hundred side) on routes with :side
router.param('side', territoryMiddleware.findRequestedBlock);

// find and load unit on routes with :unit_number
router.param('unit_number', territoryMiddleware.findRequestedUnit);
router.param('unit_number', territoryMiddleware.findRequestedSubunit);

/**
 * Save or update territory
 */
router.post('/save-territory', authenticationMiddleware.admin, territoryController.saveBlock);

/**
 * Save or update a fragment
 */
router.post('/save-fragment', authenticationMiddleware.admin, territoryController.saveFragment);

/**
 * Get list with statistics
 * of all streets in territory
 */
router.get('/list/streets', territoryController.getAllStreetStats);

/**
 * Get list with statistics of
 * all fragments found in territory
 */
router.get('/list/fragments', territoryController.getAllFragmentStats);

/**
 * Get fragment stats
 * OPTIMIZE: implement findRequestedFragment middleware
 */
router.get('/fragment/:fragment_number/stats', territoryController.getFragmentStats);

/**
 * Get street stats
 */
router.get('/street/:street_name/stats', territoryController.getStreetStats);

/**
 * Delegate to block router
 */
router.use('/street/:street_name/hundred/:hundred/:side(odd|even)', require('./block.route'));

/**
 * Delegate to unit router
 */
router.use('/street/:street_name/hundred/:hundred/unit/:unit_number', require('./unit.route'));

module.exports = router;
