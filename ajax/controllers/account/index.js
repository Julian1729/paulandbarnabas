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
const {loginValidator, signupValidator} = require(`${appRoot}/utils/validators`);
const {logger, helpers, Session, AjaxResponse, PBURLConstructor} = require(`${appRoot}/utils`);
const {FormValidationError, InvalidCredentials, SessionUninitialized} = require(`${appRoot}/errors.js`);

exports.signUp = (req, res, next) => {

    var signUpData = helpers.collectFormData([
      'first_name',
      'last_name',
      'email',
      'email_confirm',
      'phone_number',
      'password',
      'password_confirm'
    ], req);

    signupValidator(signUpData)
      .then( () => {
        var User = new UserModel(signUpData);
        User.save()
          .then((newUser) => {
            Session.createSession(req, {
              first_name: newUser.first_name,
              last_name: newUser.last_name,
              isAdmin: false,
              congregation: dev.congregationId,
              user_id: newUser._id,
              authenticated: true
            });

            // send ajax response
            return helpers.ajaxResponse(res, {
              data: {
                redirect: `${constants.base_url}/dashboard`
              }
            });
          })
          .catch(e => {
            logger.log(`Error in saving user \n${e.stack}`);
            return helpers.ajaxResponse(res, {
              status: HttpStatus.INTERNAL_SERVER_ERROR
            });
          });
      })
      .catch((validationErrors) => {
        return helpers.ajaxResponse(res, {
          error: new FormValidationError(validationErrors)
        });
      });

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
  }

  // user authenticated, create session
  let session = new Session(req);
  session.create(user);

  let dashboardUrl = PBURLConstructor.getRoute('dashboard').url();

  return ajaxRes
    .data('redirect', dashboardUrl)
    .send();
  };
