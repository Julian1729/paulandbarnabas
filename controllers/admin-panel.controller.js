const {UserSession} = require('../session/session');

const land = (req, res, next) => {

  res.render('AdminPanel/Land');

};

const createTerritory = (req, res, next) => {

  res.render('AdminPanel/CreateTerritory');

};

const createFragment = (req, res, next) => {

  res.render('AdminPanel/CreateFragment');

};

const managePublishers = (req, res, next) => {

  res.render('AdminPanel/ManagePublishers');

};

module.exports = {
  land,
  createTerritory,
  createFragment,
  managePublishers,
};
