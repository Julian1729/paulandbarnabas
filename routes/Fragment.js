const express = require('express');
const router = express.Router();

const controller = require('../controllers/Fragment');
const protected = require('./middleware/protected');



// OPTIMIZE: add middleware that authorizes user to access fragment
// (is this fragment assigned to user?)
router.get('/:fragment_id', protected, (req, res, next) => {
  controller.land(req, res, next);
});

/**
 * Block select
 */
router.get('/:fragment_id/work', protected, (req, res, next) => {
  controller.blockSelect(req, res, next);
});

/**
 * Work Block
 */
router.get('/:fragment_id/work/:block_id', protected, (req, res, next) => {
  controller.block(req, res, next);
});

/**
 * Unit Overview
 */
router.get('/:fragment_id/work/:block_id/:street_name/:hundred/:unit_number', protected, (req, res, next) => {
  controller.unit(req, res, next);
});



/**
 * Unit visit add
 */
router.get('/:fragment_id/work/:block/:unit/newvisit', protected, (req, res, next) => {
  // controller.block(req, res, next);
});


module.exports = router;
