// OPTIMIZE: Split all controllers into individual files and load file from router
// based on their name
const controllerBase = require('./base');
const Utils = require('../utils/utils');
const _ = require('lodash');
const UserValidator = require('../validators/UserValidator');
const UserModel = require('../models/User');

var ajaxResponse = (res, options, httpStatus) => {

  var responseBase = {
    status: 1,
    message: null,
    data: null
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

    var validation = UserValidator(signUpData);
    if(validation !== undefined){
      // validation failed
      ajaxResponse(res, {
        status: 0,
        data: validation
      });
      return;
    }

    // enter user into database
    // FIXME: ADD VALIDATOR TO VALIDATE.JS TO MAKE SURE
    // EMAIL IS NOT ALREADY IN USE

    var User = new UserModel(signUpData);
    User.save()
      .then((doc) => {
        console.log(doc);
      })
      .catch((e) => {
        console.log(error);
      });

  }
});

module.exports = {
  'sign-up': signUp
};
