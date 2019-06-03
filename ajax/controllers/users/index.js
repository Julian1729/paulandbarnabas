/**
 * User Ajax Controller
 */

const {UserModel} = require(`${appRoot}/models`);
const {helpers} = require(`${appRoot}/utils`);

/**
 * Get only names and ids of users
 */
exports.getList = (req, res, next) => {

  var congregationId = req.session.congregation;

  UserModel.getUsersByCongregation(congregationId)
    .then(list => {
      helpers.ajaxResponse(res, {
        data: list
      });
    })
    .catch(e => {
      helpers.ajaxResponse(res, {
        status: 500
      });
    });

};
