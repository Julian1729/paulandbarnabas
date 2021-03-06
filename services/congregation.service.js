/**
 * Congregation Services
 */
const appRoot = require('app-root-path');

const UserModel = require(`${appRoot}/models/User.model`);

/**
 * Get all users attached to a specific congregation
 * @param  {Mixed}  congregationId ObjectId or id string
 * @param  {String}  fields        Optional: fields to grab
 * @return {Promise}                Array of users
 */
exports.getUsers = async (congregationId, fields) => {

  fields = fields || '';
  return await UserModel.find({congregation: congregationId}, fields);

};
