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

// view territory
router.get('/:fragment_number', fragmentController.fragmentOverview);

// select blocks
// router.get('/:fragment_number/block-select');
//
// // block overview
// router.get('/:fragment_number/:hundred/:street_name/:side(odd|even)');
//
// // unit overview
// router.get('/:fragment_number/:unit_number/:street_name/')
//
// // hogetholder contacted
// router.use('/:fragment_number/:unit_number/:street_name/contacted');

module.exports = router;
