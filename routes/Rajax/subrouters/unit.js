/**
 * Unit Rajax Router
 */

const express = require('express');
const router = express.Router({mergeParams: true});
const HttpStatus = require('http-status-codes');

const controller = require('../../../controllers/Rajax/Territory/subcontrollers/unit');

router.use(controller.middleware.findUnit);

router.get('/test', (req, res) => {

  let territory = req.app.locals.territory;
  let unit = territory.current.unit;

  if(!unit){
    console.log('no unit');
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
  }

  res.send();

});

/**
 * Test routes
 */

module.exports = router;
