// OPTIMIZE: Split all controllers into individual files and load file from router
// based on their name
const controllerBase = require('./base');

var oneController = controllerBase.extend({
  name: 'oneController',
  run: function(req, res, next) {
    res.send(this.name);
  }
});

module.exports = {
  oneController
};
