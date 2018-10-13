const controllerBase = require('./base');

var land = (req, res, next) => {

  res.send('you are at the dashboard\n' + JSON.stringify(req.session.user));

};

module.exports = controllerBase.extend({
  land
});
