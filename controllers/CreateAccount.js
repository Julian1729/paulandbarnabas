const controllerBase = require('./base');

var run = (req, res, next) => {

  res.send('here');

};

var controller = controllerBase.extend({
  run
});

module.exports = controller;
