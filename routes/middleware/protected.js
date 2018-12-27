var Session = require('../../session/session');
var errors = require('../../errors');
var HttpStatus = require('http-status-codes');

var authenticate = (req, res, next) => {

  var session = req.session;
  try {
    Session.validate(session)
    next();
  } catch (e) {
    if(e instanceof errors.SessionUninitialized || e instanceof errors.SessionUnauthenticated){
      return res.redirect('/');
    }
  }
};

module.exports = [
  authenticate
];
