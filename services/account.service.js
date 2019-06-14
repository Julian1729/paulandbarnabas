/**
 * Account Services
 */
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const appRoot = require('app-root-path');

const models = require(`${appRoot}/models`);
const {InvalidCredentials, EmailAlreadyExists, CongregationNotFound} = require(`${appRoot}/errors`);

/**
 * Authenticate and retrieve a user
 * with their credentials
 * @param  {String}  email    User email
 * @param  {String}  password User password
 * @return {Object}          User object
 */
exports.authenticateUserCredentials = async (email, password) => {

  // find user in database
  let user = await models.UserModel.findOne({email});
  if(!user){
    throw new InvalidCredentials(`No user found with email "${email}"`);
  }
  // hash password
  let passwordCompare = await bcrypt.compare(password, user.password);
  if(passwordCompare === false){
    throw new InvalidCredentials(`Invalid password for "${email}"`);
  }

  return user;

};

/**
 * Validation and register user into database.
 * @param  {Object}  registration Object with user first name, last name, email, phone number, and password
 * @return {Object} New user object
 */
exports.registerUser = async (registration) => {

  // match congregation number to congregation id
  let congregationId = await models.CongregationModel.findOne({number: registration.congregation_number}, '_id');
  if(!congregationId){
    throw new CongregationNotFound(`Congregation #${registration.congregation_number} not registered in database.`);
  }
  registration.congregation = congregationId;

  let newUser = new models.UserModel(registration)
  ;
  try {
    user = await newUser.save();
  } catch (e) {
    if(e instanceof mongoose.Error.ValidationError && e.errors.email && e.errors.email.kind === 'unique'){
      throw new EmailAlreadyExists(`User with email "${registration.email}" already registered"`);
    }
    throw e;
  }

  return user;

};
