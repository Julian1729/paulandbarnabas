const controllerBase = require('./base');


var land = (req, res, next) => {
  // OPTIMIZE: Break login function into seperate controller
  // FIXME: Handle logout
  res.render('Login');

};

var controller = controllerBase.extend({
  name: 'Index',
  land
});

module.exports = controller;
