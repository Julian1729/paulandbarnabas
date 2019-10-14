const appRoot = require('app-root-path');

const {authenticateUserCredentials} = require(`${appRoot}/services/account.service`);
const {Session, AjaxResponse} = require(`${appRoot}/utils`);
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

exports.rooseveltGeneralUser = async (req, res) => {

    let ajaxRes = new AjaxResponse(res);

    let user = await authenticateUserCredentials('julian@julianhernandez.me', 'acts20:21');
    // user authenticated, create session
    let session = new Session(req);
    await session.create(user);

    // let dashboardUrl = PBURLConstructor.getRoute('dashboard').url();

    return res.redirect('/dashboard');

};
