const appRoot = require('app-root-path');

const {PBURLConstructor, logger} = require(`${appRoot}/utils`);

exports.land = (req, res) => {

  let renderVars = {
    loggedOut: false,
    urls: {
      congregation_registration: PBURLConstructor.getRoute('registration-congregation').url(),
      user_registration: PBURLConstructor.getRoute('registration-user').url(),
    },
  };

  if(req.query.logout){
    req.session.destroy();
    renderVars.loggedOut = true;
    logger.verbose('User logged out');
  }

  res.render('Login', renderVars);

};
