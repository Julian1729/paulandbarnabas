const express = require('express');
const router = express.Router();

const protected = require('../middleware/protected');

router.use(protected);

router.get('/', (req, res, next) => {
  res.send(`NOT CONFIGURED: "/territory" route`)
});

router.use('/fragment/:fragment_id', require('./Fragment'));

// router.get('/fragment/:fragment_id', (req, res, next) => {
//   res.send('hello from fragment route');
// });

module.exports = router;
