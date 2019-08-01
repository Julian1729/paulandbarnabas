const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const {territoryMiddleware, authenticationMiddleware} = require(`${appRoot}/middleware`);
const {fragmentController} = require(`${appRoot}/controllers`);

router.use(authenticationMiddleware.session, territoryMiddleware.findTerritory);

router.param('fragment_number', territoryMiddleware.findRequestedFragment);

router.param('fragment_number', territoryMiddleware.findUserFragments);

router.param('fragment_number', territoryMiddleware.findRequestedFragmentBlocks);

router.param('unit_number', territoryMiddleware.findRequestedUnit);

// Fragment Overview - select block to view
router.get('/:fragment_number', fragmentController.fragmentOverview);

// Block Overview - select unit to view
router.get('/:fragment_number/:hundred/:street_name/:side(odd|even)', fragmentController.blockOverview);

// // unit overview
// router.get('/:fragment_number/:unit_number/:street_name/')
//
// // hogetholder contacted
// router.use('/:fragment_number/:unit_number/:street_name/contacted');

module.exports = router;
