/**
 * User Ajax Controller
 */

const UserModel = require('../../models/User');
const {ajaxResponse} = require('./Base');

/**
 * Get only names and ids of users
 */
var getList = (req, res, next) => {

  UserModel.getList()
    .then(list => {
      ajaxResponse(res, {
        data: list
      });
    })
    .catch(e => {
      ajaxResponse(res, {
        status: 500
      });
    });

};

module.exports = {
  getList
};
