const express = require('express');
const router = express.Router();
const appRoot = require('app-root-path');

const protected = require(`${appRoot}/middleware/protected`);
const {territoryController} = require(`${appRoot}/controllers`);

router.use(protected, territoryController.middleware.initAssetCollection, territoryController.middleware.findUserTerritory, territoryController.middleware.constructURLs);

router.get('/', (req, res, next) => {
  res.send(`NOT CONFIGURED: "/territory" route`)
});

/**
 * Main User Endpoint
 */
router.use('/fragment/:fragment_number', require('./fragment.route'));

module.exports = router;
