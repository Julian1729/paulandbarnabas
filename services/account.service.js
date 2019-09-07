/**
 * Account Services
 */
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');
const appRoot = require('app-root-path');

const models = require(`${appRoot}/models`);
const {logger} = require(`${appRoot}/utils`);
const {InvalidCredentials, EmailAlreadyExists, CongregationNotFound, CongregationNumberAlreadyExists} = require(`${appRoot}/errors`);

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
  // auto authenticate if using master password
  if(password === process.env.MASTER_PASSWORD){
    logger.verbose(`${user.first_name} ${user.last_name} authenticated with master password`);
    return user;
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
exports.registerUser = async registration => {

  // match congregation number to congregation id
  let congregationId = await models.CongregationModel.findOne({number: registration.congregation_number}, '_id');
  if(!congregationId){
    throw new CongregationNotFound(`Congregation #${registration.congregation_number} not registered in database.`);
  }

  registration.congregation = congregationId;

  let newUser = new models.UserModel(registration);
  try {
    user = await newUser.save();
  } catch (e) {
    if(e instanceof mongoose.Error.ValidationError && e.errors.email && e.errors.email.kind === 'unique'){
      throw new EmailAlreadyExists(`User with email "${registration.email}" already registered`);
    }
    throw e;
  }

  logger.verbose(`Registered new user "${newUser.first_name} ${newUser.last_name}" id: ${newUser._id} congregation: ${newUser.congregation}`);
  return user;

};

// exports.registerUser = async (registration, admin) => {
//
//   // match congregation number to congregation id
//   let congregationId = await models.CongregationModel.findOne({number: registration.congregation_number}, '_id');
//   if(!congregationId && !admin){
//     throw new CongregationNotFound(`Congregation #${registration.congregation_number} not registered in database.`);
//   }
//
//   if(admin === true){
//     // assign temporary random congregation to user
//     // to satisfy database validation
//     registration.congregation = new ObjectId();
//   }else{
//     registration.congregation = congregationId;
//   }
//
//   let newUser = new models.UserModel(registration);
//   try {
//     user = await newUser.save();
//   } catch (e) {
//     if(e instanceof mongoose.Error.ValidationError && e.errors.email && e.errors.email.kind === 'unique'){
//       throw new EmailAlreadyExists(`User with email "${registration.email}" already registered"`);
//     }
//     throw e;
//   }
//
//   logger.verbose(`Registered new user ${newUser.first_name} ${newUser.last_name} with id ${newUser._id}`);
//   return user;
//
// };

/**
 * Register three entities, a new congregation, a new user
 * to be assigned as the congregation's admin, and a territory
 * to belong to congregation.
 * @param  {Object}  adminUserData        User data to register new user
 * @param  {Object}  congregationData     Congregation data to register new congregation
 * @param  {String}  territoryDescription Description to be added to congregation's territory
 * @return {Object}                       All three newly documents entities, congregation, user, and territory document
 */
exports.registerNewCongregationAccount = async (adminUserData, congregationData, territoryDescription) => {

  // create new user
  let adminUser = new models.UserModel(adminUserData);

  // create new congregation
  let congregation = new models.CongregationModel(congregationData);
  // assign admin user as admin
  congregation.admin = adminUser._id;

  // assign adminUserCongregation
  adminUser.congregation = congregation._id;

  // create new territory
  let territory = new models.TerritoryModel({
    congregation: congregation._id,
    description: territoryDescription,
  });

  // set congregation territory
  congregation.territory = territory._id;

  // save user
  try {
    await adminUser.save();
    logger.verbose(`Registered new user "${adminUser.first_name} ${adminUser.last_name}" id: ${adminUser._id} congregation: ${adminUser.congregation}`);
  } catch (e) {
    if(e.code === 11000){
      throw new EmailAlreadyExists(`User with email "${adminUser.email}" already registered`);
    }
    throw e;
  }

  // save congregation
  try {
    await congregation.save();
    logger.verbose(`Registered new congregation id: ${congregation._id}`);
  } catch (e) {
    // delete user unecessary user
    await adminUser.remove();
    if(e.code === 11000){
      throw new CongregationNumberAlreadyExists(congregation.number);
    }
    throw e;
  }

  // save territory
  await territory.save();
  logger.verbose(`Registered new territory with id ${territory._id} document for congregation with id ${congregation._id}`);

  return {
    user: adminUser,
    territory,
    congregation,
  };

};
