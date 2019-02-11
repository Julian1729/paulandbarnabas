const controllerBase = require('./base');

var land = (req, res, next) => {

  //res.send('you are at the dashboard\n' + JSON.stringify(req.session, null, 2));
  res.render('Dashboard');

};

module.exports = controllerBase.extend({
  land
});
