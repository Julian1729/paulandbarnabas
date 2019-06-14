/**
 * Ajax Account Controller
 *
 * Gateway to all modifications done to any user account
 */
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const UserModel = require(`${appRoot}/models`);
const {accountServices} = require(`${appRoot}/services`);
const constants = require(`${appRoot}/config/constants`);
const {loginValidator, registrationValidator} = require(`${appRoot}/utils/validators`);
const {logger, helpers, Session, AjaxResponse, PBURLConstructor} = require(`${appRoot}/utils`);
const {FormValidationError, InvalidCredentials, SessionUninitialized, EmailAlreadyExists, CongregationNotFound} = require(`${appRoot}/errors.js`);

exports.register = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);
  ajaxRes.validErrors = ['FORM_VALIDATION_ERROR', 'SERVER_ERROR', 'UNREGISTERED_CONGREGATION'];

  let registration = helpers.collectFormData([
    'first_name',
    'last_name',
    'congregation_number',
    'email',
    'email_confirm',
    'phone_number',
    'password',
    'password_confirm'
  ], req);

  // validate form data
  let validationErrors = registrationValidator(registration);
  if(validationErrors){
    return ajaxRes
        .error('FORM_VALIDATION_ERROR', null, {validationErrors: validationErrors})
        .send();
  }

  let registeredUser = null;
  try{
    registeredUser = await accountServices.registerUser(registration);
  }catch(e){
    if(e instanceof EmailAlreadyExists){
      logger.verbose(e.message);
      return ajaxRes
          .error('FORM_VALIDATION_ERROR', e.message, {validationErrors: {email: 'Email already exists'}})
          .send();
    }
    if(e instanceof CongregationNotFound){
      logger.verbose(e.message);
      return ajaxRes.error('UNREGISTERED_CONGREGATION', e.message).send();
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
  }

  let session = new Session(req);
  session.create(registeredUser);
  ajaxRes.data('redirect', PBURLConstructor.getRoute('dashboard').url());
  return ajaxRes.send();


};

exports.login = async (req, res, next) => {

  let ajaxRes = new AjaxResponse(res);
  ajaxRes.validErrors = ['FORM_VALIDATION_ERROR', 'INVALID_CREDENTIALS'];

  // collect data
  var loginData = helpers.collectFormData([
    'email',
    'password'
  ], req);

  // validate input
  var validation = loginValidator(loginData);
  if(validation){
    // validation failed, create ajax error and attach validation errors
    ajaxRes.error('FORM_VALIDATION_ERROR', '', {validationErrors: validation});
    return ajaxRes.send();
  }

  let user = null;
  try {
    user = await accountServices.authenticateUserCredentials(loginData.email, loginData.password);
  } catch (e) {
    if(e instanceof InvalidCredentials){
      logger.verbose(e.message);
      ajaxRes.error('INVALID_CREDENTIALS', 'Invalid user credentials');
      return ajaxRes.send();
    }
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
  }

  // user authenticated, create session
  let session = new Session(req);
  session.create(user);

  let dashboardUrl = PBURLConstructor.getRoute('dashboard').url();

  return ajaxRes
    .data('redirect', dashboardUrl)
    .send();
  };
