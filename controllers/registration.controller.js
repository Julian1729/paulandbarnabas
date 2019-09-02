const ISO6391 = require('iso-639-1');
const appRoot = require('app-root-path');

const {PBURLConstructor} = require(`${appRoot}/utils`);

exports.user = (req, res) => {
  let renderVars = {
    localize: {
      endpoints: {
        user_registration: PBURLConstructor.getRoute('user-registration').url()
      }
    }
  }
  // show signup landing page
  res.render('UserRegister', renderVars);
};

exports.congregation = (req, res) => {

  let renderVars = {
    localize: {
      endpoints: {
        congregation_registration: PBURLConstructor.getRoute('congregation-registration').url(),
      },
    },
    languages: ISO6391.getAllNames(),
  }

  res.render('CongregationRegister', renderVars);

};
