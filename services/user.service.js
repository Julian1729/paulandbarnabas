const appRoot = require('app-root-path');

const errors = require(`${appRoot}/errors`);
const {UserModel, CongregationModel} = require(`${appRoot}/models`);

exports.isAdmin = async (user) => {

  // find congregation
  let congregation = await CongregationModel.findOne({_id: user.congregation});
  if(!congregation){
    throw new errors.CongregationNotFound(`Congregation with id ${user.congregation} not found.`);
  }
  return congregation.admin.equals(user._id);

};
