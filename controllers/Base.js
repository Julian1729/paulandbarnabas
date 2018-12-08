_ = require('lodash');
const constants = require('../config/constants');
const path = require('path');

module.exports = {
  name: 'base',
  constants,
  extend: function(child){
    return _.extend({}, this, child);
  },
  run: (req, res, next) => {
    console.log(`"run" function has not been defined.`);
  }
};
