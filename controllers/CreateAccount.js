const controllerBase = require('./base');


/**
 * GET
 */
var land = (req, res, next) => {
  // show signup landing page
  res.render('CreateAccount');
};

/**
 * POST
 */
var register = (req, res, next) => {

};



module.exports = controllerBase.extend({
  land,
  register
});
