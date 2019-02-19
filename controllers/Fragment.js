const controllerBase = require('./base');
const TerritoryModel = require('../models/Territory');
const UserModel = require('../models/User');
const Session = require('../session/session');

var land = (req, res, next) => {

  var user = Session.pickUserCredentials(req);

  

  res.render('Fragment/FragmentOverview');

};

module.exports = controllerBase.extend({
  land
});
