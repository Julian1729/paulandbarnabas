/**
 * Gateway router for /territory
 */
const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

const {territoryController} = require(`${appRoot}/ajax/controllers/territory`);
const {territoryMiddleware, authenticationMiddleware} = require(`${appRoot}/middleware`);

router.use(territoryMiddleware.findTerritory);

/**
 * Save or update territory
 */
// FIXME: authenticate as admin
router.post('/save-territory', authenticationMiddleware.session, authenticationMiddleware.admin, territoryController.saveTerritory);

/**
 * Save or update a fragment
 */
// FIXME: authenticate as admin
router.post('/save-fragment', () => {
  res.status(501).send();
});

/**
 * List all streets found in territory
 */
router.get('/list/streets', () => {
  res.status(501).send();
});

/**
 * List all streets found in territory
 */
router.get('/list/fragments', () => {
  res.status(501).send();
});

/**
 * Get fragment stats
 */
router.get('/fragment/:fragment_number/stats', () => {
  res.status(501).send();
});

/**
 * Get street stats
 */
router.get('/street/:street_name/stats', () => {
  res.status(501).send();
});

/**
 * Add units to hundred
 * // FIXME: is this needed? is it ever used?
 */
// router.use('/street/:street_name/hundred/:hundred/add-units', () => {
//   res.status(501).send();
// });

/**
 * Delegate to block router
 */
router.use('/street/:street_name/hundred/:hundred/:side', require('./block.route'));

/**
 * Delegate to unit router
 */
router.use('/street/:street_name/hundred/:hundred/unit/:unit_number', require('./unit.route'));
