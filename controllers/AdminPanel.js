const controllerBase = require('./base');

var land = (req, res, next) => {

  res.render('AdminPanel/Land');

};

module.exports = controllerBase.extend({
  land
});
