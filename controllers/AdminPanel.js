const controllerBase = require('./base');

var land = (req, res, next) => {

  res.render('AdminPanel/Land');

};

var createTerritory = (req, res, next) => {
  res.render('AdminPanel/CreateTerritory');
};

module.exports = controllerBase.extend({
  land,
  createTerritory
});
