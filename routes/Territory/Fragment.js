const express = require('express');
const router = express.Router({mergeParams: true});

const controller = require('../../controllers/Territory/Fragment');
const protected = require('../middleware/protected');

// OPTIMIZE: add middleware that authorizes user to access fragment
// (is this fragment assigned to user?)

router.all('*', controller.middleware.initRenderVars, controller.middleware.findUserFragments, controller.middleware.findRequestedFragment, controller.middleware.findFragmentBlocks);

/**
 * Show fragment overview. Lead to block select
 */
router.get('/', controller.endpoints.fragmentOverview);

/**
 * Blocks
 */
router.get('/blocks', controller.endpoints.blockSelect);
// register middleware to find requested block
router.all('/blocks/:block_id*', controller.middleware.findRequestedBlock);
router.get('/blocks/:block_id', controller.endpoints.blockOverview);

/**
 * Delegate Unit CRUD to Unit router
 */
router.use('/blocks/:block_id/unit/:unit_number', require('./Unit'));


module.exports = router;
