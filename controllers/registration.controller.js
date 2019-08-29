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
  res.render('Register', renderVars);
};

exports.congregation = (req, res) => {
  res.send('Signup admin');
};
