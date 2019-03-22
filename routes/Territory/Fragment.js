const express = require('express');
const router = express.Router({mergeParams: true});

const controller = require('../../controllers/Territory/Fragment');
const protected = require('../middleware/protected');

// OPTIMIZE: add middleware that authorizes user to access fragment
// (is this fragment assigned to user?)

router.all('/:fragment_id*', controller.middleware.initRenderVars, controller.middleware.findUserFragments, controller.middleware.findRequestedFragment, controller.middleware.findFragmentBlocks);

/**
 * Show fragment overview. Lead to block select
 */
router.get('/:fragment_id', controller.endpoints.fragmentOverview);

/**
 * Block select
 */
router.get('/:fragment_id/blocks', controller.endpoints.blockSelect);

/**
 * Block overview
 */
router.all('/:fragment_id/blocks/:block_id*', controller.middleware.findRequestedBlock);

router.get('/:fragment_id/blocks/:block_id', controller.endpoints.blockOverview);

/**
 * Delegate Unit CRUD to Unit router
 */
router.use('/:fragment_id/blocks/:block_id/unit', require('./Unit'));


module.exports = router;
