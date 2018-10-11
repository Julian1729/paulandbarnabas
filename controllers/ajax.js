// OPTIMIZE: Split all controllers into individual files and load file from router
// based on their name
const controllerBase = require('./base');
const Utils = require('../utils/utils');
const _ = require('lodash');
const UserValidator = require('../validators/UserValidator');
const UserModel = require('../models/User');
const config = require('../config/config')();

/**
 * Send back a standard JSON response to an ajax request
 * @param  {[Object]} res Express response object to be able to execute response
 * @param  {[Object]} options Object used to pass in options {status: (default 1), message: {String}, data: null | object, validation: validation errors obj}
 * @param  {[Number]} httpStatus HTTP status code
 * @return {[void]}
 */
var ajaxResponse = (res, options, httpStatus) => {

  var responseBase = {
    status: 1,
    message: null,
    data: null,
    validation: null
  };

  var response = _.extend({}, responseBase, options);

  if(httpStatus){
    res.status(httpStatus).json(response);
  }else{
    res.json(response);
  }

  return;

};

var signUp = controllerBase.extend({
  name: 'sign-up',
  run: function(req, res, next){

    var signUpData = Utils.collectFormData([
      'first_name',
      'last_name',
      'email',
      'password',
      'password_confirm'
    ], req);

    UserValidator(signUpData)
      .catch((validationErrors) => {
        ajaxResponse(res, {
          status: 1,
          validation: validationErrors
        });
      });

    // enter user into database
    // FIXME: ADD VALIDATOR TO VALIDATE.JS TO MAKE SURE
    // EMAIL IS NOT ALREADY IN USE

    var User = new UserModel(signUpData);
    User.save()
      .then((doc) => {
        ajaxResponse(res, {
          status: 1,
          data: {
            redirect: `${config.base_url}/dashboard`
          }
        });
      })
      .catch((e) => {
        ajaxResponse(res, {
          status: 0,
          message: `Unable to save user to database, ${e}`
        });
      });

  }
});

module.exports = {
  'sign-up': signUp
};
