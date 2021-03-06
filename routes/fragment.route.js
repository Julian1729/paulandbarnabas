const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const {territoryMiddleware, authenticationMiddleware} = require(`${appRoot}/middleware`);
const {fragmentController} = require(`${appRoot}/controllers`);

router.use(authenticationMiddleware.session, authenticationMiddleware.localizeSession, territoryMiddleware.findTerritory);

router.param('fragment_number', territoryMiddleware.findRequestedFragment);

router.param('fragment_number', territoryMiddleware.findUserFragments);

router.param('fragment_number', territoryMiddleware.findRequestedFragmentBlocks);

router.param('unit_number', territoryMiddleware.findRequestedFragmentUnit);

// Fragment Overview - select block to view
router.get('/:fragment_number', fragmentController.fragmentOverview);

// Block Overview - select unit to view
router.get('/:fragment_number/:hundred/:street_name/:side(odd|even)', fragmentController.blockOverview);

// Unit Overview - view unit visit, notes, tags and add unit visit
router.get('/:fragment_number/:unit_number/:street_name', fragmentController.unitOverview);

// // hogetholder contacted
router.use('/:fragment_number/:unit_number/:street_name/contacted', fragmentController.householderContacted);

module.exports = router;
