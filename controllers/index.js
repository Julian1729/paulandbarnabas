const controllerBase = require('./base');

var controller = controllerBase.extend({
  name: 'Index',
  run: (req, res, next) => {
    req.session.start = 'here';
    // render template
    res.render('landing/login', {
      title: 'Yeet',
      message: 'yeet',
      session: req.session
    });
  }
});

module.exports = controller;
