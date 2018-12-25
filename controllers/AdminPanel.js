const controllerBase = require('./base');

const {UserSession} = require('../session/session');
const dev = require('../dev_vars');

var land = (req, res, next) => {

  res.render('AdminPanel/Land');

};

var createTerritory = (req, res, next) => {

  req.session.congregation = dev.congregationId;

  res.render('AdminPanel/CreateTerritory');
};

module.exports = controllerBase.extend({
  land,
  createTerritory
});
