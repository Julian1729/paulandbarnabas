const controllerBase = require('./base');

const {UserSession} = require('../session/session');

var land = (req, res, next) => {

  res.render('AdminPanel/Land');

};

var createTerritory = (req, res, next) => {

  res.render('AdminPanel/CreateTerritory');

};

var createFragment = (req, res, next) => {

  res.render('AdminPanel/CreateFragment');

};

var managePublishers = (req, res, next) => {

  res.render('AdminPanel/ManagePublishers');

};

module.exports = controllerBase.extend({
  land,
  createTerritory,
  createFragment,
  managePublishers
});
