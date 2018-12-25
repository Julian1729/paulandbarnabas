/**
 * User Ajax Controller
 */

const UserModel = require('../../models/User');
const {ajaxResponse} = require('./Base');
const {UserSession} = require('../../session/session');

/**
 * Get only names and ids of users
 */
var getList = (req, res, next) => {

  var congregationId = req.session.congregation;

  UserModel.getUsersByCongregation(congregationId)
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
