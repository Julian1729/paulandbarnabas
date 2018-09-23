const controllerBase = require('./base');

var login = (req, res, next) => {
  var email = req.body.email;
  var password = req.body.password;

};

var run = (req, res, next) => {
  // OPTIMIZE: Break login function into seperate controller
  if(req.body.login !== undefined){
    return login(req, res, next);
    //res.send('hd')
  }

  // FIXME: Handle logout

  res.render('landing');

};

var controller = controllerBase.extend({
  name: 'Index',
  run
});

module.exports = controller;
