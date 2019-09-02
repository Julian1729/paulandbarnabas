/**
 * Ajax Account Controller
 *
 * Gateway to all modifications done to any user account
 */
const _ = require('lodash');
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const UserModel = require(`${appRoot}/models`);
const {accountServices} = require(`${appRoot}/services`);
const constants = require(`${appRoot}/config/constants`);
const {loginValidator, userRegistrationValidator, congregationRegistrationValidator} = require(`${appRoot}/utils/validators`);
const {logger, helpers, Session, AjaxResponse, PBURLConstructor} = require(`${appRoot}/utils`);
const {FormValidationError, InvalidCredentials, SessionUninitialized, EmailAlreadyExists, CongregationNotFound, CongregationNumberAlreadyExists} = require(`${appRoot}/errors.js`);

exports.registerUser = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);
  ajaxRes.validErrors = ['FORM_VALIDATION_ERROR', 'UNREGISTERED_CONGREGATION'];

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
  let validationErrors = userRegistrationValidator(registration);
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
  await session.create(registeredUser);
  ajaxRes.data('redirect', PBURLConstructor.getRoute('dashboard').url());
  return ajaxRes.send();


};

exports.registerCongregation = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);
  ajaxRes.validErrors = ['FORM_VALIDATION_ERROR', 'EMAIL_ALREADY_EXISTS', 'CONGREGATION_NUMBER_REGISTERED'];

  let formData = _.pick(req.body, ['user', 'congregation', 'territory']);

  let validationErrors = congregationRegistrationValidator(formData);
  if(validationErrors){
    return ajaxRes.error('FORM_VALIDATION_ERROR', null, {validationErrors}).send();
  }

  // discern users title in relation to service overseer (formData.user.position)
  switch (formData.user.position) {
    case 'himself':
      formData.user.title = 'Service Overseer';
      break;
    case 'assistant':
      formData.user.title = 'Assistant to Service Overseer';
      break;
    case 'elder':
      formData.user.title = 'Elder';
      break;
    default:
      formData.user.title = 'Publisher';
  }

  let newAccounts = null;
  try {
    newAccounts = await accountServices.registerNewCongregationAccount(formData.user, formData.congregation, formData.territory.description);
  } catch (e) {
    if(e instanceof EmailAlreadyExists){
      return ajaxRes.error('EMAIL_ALREADY_EXISTS', `A user with email "${formData.user.email}" already exists`, {email: formData.user.email});
    }
    if(e instanceof CongregationNumberAlreadyExists){
      return ajaxRes.error('CONGREGATION_NUMBER_REGISTERED', `Congregation #${formData.congregation.number} already registered`);
    }
    throw e;
  }

  ajaxRes.data('admin', newAccounts.user);
  ajaxRes.data('congregation', newAccounts.congregation);
  ajaxRes.data('territory', newAccounts.territory);
  ajaxRes.data('redirect', PBURLConstructor.getRoute('dashboard').url());

  // init session for new admin user
  let session = new Session(req);
  await session.create(newAccounts.user);
  return ajaxRes.send();

};

exports.login = async (req, res) => {

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
  await session.create(user);

  let dashboardUrl = PBURLConstructor.getRoute('dashboard').url();

  return ajaxRes
    .data('redirect', dashboardUrl)
    .send();
  };
