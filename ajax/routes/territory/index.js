/**
 * Gateway router for /territory
 */
const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

const {territoryController} = require(`${appRoot}/ajax/controllers/territory`);
const {territoryMiddleware, authenticationMiddleware} = require(`${appRoot}/middleware`);

router.use(authenticationMiddleware.session, territoryMiddleware.findTerritory);

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
 */
router.get('/fragment/:fragment_number/stats', territoryController.getFragmentStats);

/**
 * Get street stats
 */
router.get('/street/:street_name/stats', territoryController.getStreetStats);

/**
 * Delegate to block router
 */
router.use('/street/:street_name/hundred/:hundred/:side', require('./block.route'));

/**
 * Delegate to unit router
 */
router.use('/street/:street_name/hundred/:hundred/unit/:unit_number', require('./unit.route'));
