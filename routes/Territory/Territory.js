const express = require('express');
const router = express.Router();

const protected = require('../middleware/protected');
const controller = require('../../controllers/Territory/Territory');

router.use(protected, controller.middleware.initAssetCollection, controller.middleware.findUserTerritory, controller.middleware.constructURLs);

router.get('/', (req, res, next) => {
  res.send(`NOT CONFIGURED: "/territory" route`)
});

/**
 * Main User Endpoint
 */
router.use('/fragment/:fragment_number', require('./Fragment'));

module.exports = router;
