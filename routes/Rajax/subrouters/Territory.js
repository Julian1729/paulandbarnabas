const express = require('express');
const router = express.Router({mergeParams: true});
const HttpStatus = require('http-status-codes');

const controller = require('../../../controllers/Rajax/Territory/Territory');

router.use(controller.middleware.findUserTerritory);

router.get('/test', (req, res, next) => {
  if(!req.app.locals.territory.territory){
    req.status(HttpStatus.INTERNAL_SERVER_ERROR).send('No territory object');
  }
  res.send();
})

router.use('/street', require('./street'));

// router.use('/unit', require('./unit'));

module.exports = router;
