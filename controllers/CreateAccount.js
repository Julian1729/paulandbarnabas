const controllerBase = require('./base');


/**
 * GET
 */
var land = (req, res, next) => {
  // show signup landing page
  res.render('CreateAccount');
};

module.exports = controllerBase.extend({
  land
});
