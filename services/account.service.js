/**
 * Account Services
 */
const bcrypt = require('bcrypt');
const appRoot = require('app-root-path');

const models = require(`${appRoot}/models`);
const {InvalidCredentials} = require(`${appRoot}/errors`);

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
    throw new InvalidCredentials(`No user found with email ${email}`);
  }
  // hash password
  let passwordCompare = await bcrypt.compare(password, user.password);
  if(passwordCompare === false){
    throw new InvalidCredentials(`Invalid password for ${email}`);
  }

  return user;

};
