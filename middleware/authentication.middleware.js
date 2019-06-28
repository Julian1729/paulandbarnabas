const appRoot = require('app-root-path');
let HttpStatus = require('http-status-codes');

let errors = require(`${appRoot}/errors`);
let {cache} = require(`${appRoot}/dev/seed-database`);
let {logger, Session, AjaxResponse} = require(`${appRoot}/utils`);

exports.session = (req, res, next) => {

  let session = new Session(req);
  try {
    let missing = session.validate();
    if(!session.isAuthenticated()){
      throw new errors.SessionUnauthenticated();
    }
  } catch (e) {
    if(e instanceof errors.SessionUninitialized || e instanceof errors.SessionUnauthenticated){
      return res.redirect('/');
    }
    next(e);
  }

  next();

};

exports.ajaxSession = (req, res, next) => {

  let session = new Session(req);
  try {
    let missing = session.validate();
    if(!session.isAuthenticated()){
      throw new errors.SessionUnauthenticated();
    }
  } catch (e) {
    if(e instanceof errors.SessionUninitialized || e instanceof errors.SessionUnauthenticated){
      return res.status(HttpStatus.UNAUTHORIZED).send();
    }
    next(e);
  }

  next();

};

exports.ajaxAdmin = (req, res, next) => {

  let session = new Session(req);
  if(!session.isAdmin){
    return res.status(HttpStatus.FORBIDDEN).send();
  }
  return next();

};

exports.admin = (req, res, next) => {

  let session = new Session(req);
  if(!session.isAdmin){
    return res.redirect('/');
  }
  next();

};

exports.devSessionAdmin = async (req, res, next) => {

  if(process.env.NODE_ENV !== 'development') return next();


  let session = new Session(req);
  await session.create(cache.primaryUser);
  logger.info(`Dev session initialized as "${cache.primaryUser.first_name} ${cache.primaryUser.last_name}" with admin abilites`);
  return next();

};

/**
 * Attach session variables to req.locals
 * to make available to pug templates
 */
exports.localizeSession =  (req, res, next) => {
  let userCreds = Session.pickUserCredentials(req.session);
  res.locals.user = userCreds;
  req.app.locals.user = userCreds;
  next();
};
