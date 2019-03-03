const express = require('express');
const router = express.Router();

const protected = require('../middleware/protected');

router.use(protected);

router.get('/', (req, res, next) => {
  res.send(`NOT CONFIGURED: "/territory" route`)
});

/**
 * Main User Endpoint
 */
router.use('/fragment', require('./Fragment'));

module.exports = router;
