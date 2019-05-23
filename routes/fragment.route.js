const express = require('express');
const router = express.Router({mergeParams: true});
const appRoot = require('app-root-path');

const {fragmentController} = require(`${appRoot}/controllers`);
const protected = require(`${appRoot}/middleware/protected`);

// OPTIMIZE: add middleware that authorizes user to access fragment
// (is this fragment assigned to user?)

router.all('*', fragmentController.middleware.initRenderVars, fragmentController.middleware.findUserFragments, fragmentController.middleware.findRequestedFragment, fragmentController.middleware.findFragmentBlocks);

/**
 * Show fragment overview. Lead to block select
 */
router.get('/', fragmentController.endpoints.fragmentOverview);

/**
 * Blocks
 */
router.get('/blocks', fragmentController.endpoints.blockSelect);
// register middleware to find requested block
router.all('/block/:block_id*', fragmentController.middleware.findRequestedBlock);
router.get('/block/:block_id', fragmentController.endpoints.blockOverview);

/**
 * Delegate Unit CRUD to Unit router
 */
router.use('/block/:block_id/unit/:unit_number', require('./unit.route'));


module.exports = router;
