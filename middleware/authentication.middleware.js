const _ = require('lodash');
const appRoot = require('app-root-path');
let HttpStatus = require('http-status-codes');

let errors = require(`${appRoot}/errors`);
let {cache} = require(`${appRoot}/dev/seed-database`);
let {logger, Session, AjaxResponse, PBURLConstructor} = require(`${appRoot}/utils`);

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
    return next(e);
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
    return next(e);
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
  return next();

};

exports.devSessionAdmin = async (req, res, next) => {

  if(process.env.NODE_ENV !== 'development') return next();
  if(req.session.authenticated === true) return next();

  let session = new Session(req);
  await session.create(cache.primaryUser);
  logger.info(`Dev session initialized as "${cache.primaryUser.first_name} ${cache.primaryUser.last_name}" with admin abilites`);
  return next();

};

exports.loggedInRedirect = (req, res, next) => {

  let session = new Session(req);

  if(session.isAuthenticated() === true) return res.redirect(PBURLConstructor.getRoute('dashboard').url());

  return next();

};

/**
 * Attach session variables to req.locals
 * to make available to pug templates
 */
exports.localizeSession =  (req, res, next) => {

  res.locals.user = _.pick(req.session, ['first_name', 'last_name', 'user_id', 'congregation', 'isAdmin']);

  return next();

};
