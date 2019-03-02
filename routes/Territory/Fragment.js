const express = require('express');
const router = express.Router();

const controller = require('../../controllers/Territory/Fragment');

// OPTIMIZE: add middleware that authorizes user to access fragment
// (is this fragment assigned to user?)


/**
 * Show fragment overview. Lead to block select
 */
router.get('/', (req, res, next) => {
  res.send(`hello from Fragment overview route`);
});
// router.get('/', controller.land);

/**
 * Block select
 */
router.get('/blocks', (req, res, next) => {
  res.send(`hello from Fragment block select route`);
});
// router.get('/:fragment_id/blocks', controller.blockSelect);

/**
 * Block overview
 */
router.get('/blocks/:block_id', (req, res, next) => {
  res.send(`hello from Fragment work block route`)
});;
// router.get('/:fragment_id/blocks/:block_id', controller.block);

/**
 * Delegate Unit CRUD to Unit router
 */
router.use('/blocks/:block_id/unit/:unit_id', require('./Unit'));


module.exports = router;
