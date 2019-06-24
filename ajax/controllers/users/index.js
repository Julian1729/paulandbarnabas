/**
 * User Ajax Controller
 */
const appRoot = require('app-root-path');

const {helpers, AjaxResponse} = require(`${appRoot}/utils`);
const {congregationServices} = require(`${appRoot}/services`);

/**
 * Get only names and ids of users
 */
exports.list = async (req, res) => {

  let ajaxRes = new AjaxResponse(res);

  let congregationId = req.session.congregation;
  let fields = req.query.fields || '';

  let users = await congregationServices.getUsers(congregationId, fields);
  // strip password from user objects
  for (let user of users) {
    user.password = undefined;
  }

  return ajaxRes.data('users', users).send();

};
