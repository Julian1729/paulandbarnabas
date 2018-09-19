const controllerBase = require('./base');

var controller = controllerBase.extend({
  name: 'Index',
  run: (req, res, next) => {
    // render template
    res.render('index', {
      title: 'Yeet',
      message: 'yeet'
    });
  }
});

module.exports = controller;
