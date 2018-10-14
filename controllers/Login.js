const controllerBase = require('./base');


var land = (req, res, next) => {
  // FIXME: Handle logout
  res.render('Login');
};

var controller = controllerBase.extend({
  name: 'Index',
  land
});

module.exports = controller;
