const appRoot = require('app-root-path');
const {logger} = require(`${appRoot}/utils`);

exports.land = (req, res) => {

  let renderVars = {loggedOut: false};

  if(req.query.logout){
    req.session.destroy();
    renderVars.loggedOut = true;
    logger.verbose('User logged out');
  }

  res.render('Login', renderVars);

};
