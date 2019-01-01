var Session = require('../../session/session');
var errors = require('../../errors');
var HttpStatus = require('http-status-codes');
var seedData = require('../../dev/seed/data');

var authenticate = (req, res, next) => {
  
  var session = req.session;
  try {
    Session.validate(session)
    return next();
  } catch (e) {
    if(e instanceof errors.SessionUninitialized || e instanceof errors.SessionUnauthenticated){
      // if in dev mode...create session with mock data
      if(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'testing'){
        Session.createSession(req, seedData.sessions.admin);
        Session.validate(session);
        console.log('session from middlware', session);
        return next();
      }
      return res.redirect('/');
    }
  }

};

module.exports = [
  authenticate
];
