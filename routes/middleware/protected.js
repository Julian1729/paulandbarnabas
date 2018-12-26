var Session = require('../../session/session');
var errors = require('../../errors');
var HttpStatus = require('http-status-codes');

var authenticate = (req, res, next) => {

  var session = req.session;
  try {
    Session.validate(session)
    next();
  } catch (e) {
    if(e instanceof errors.SessionUninitialized){
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('this is 500 error');
    }
    if(e instanceof errors.SessionUnauthenticated){
      return res.status(HttpStatus.FORBIDDEN).send('this is 403 forbidden');
    }
  }
};

module.exports = [
  authenticate
];
