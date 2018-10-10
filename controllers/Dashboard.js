const controllerBase = require('./base');

var land = (req, res, next) => {

  res.send('you are at the dashboard');

};

module.exports = controllerBase.extend({
  land
});
