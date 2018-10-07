_ = require('lodash');
const constants = require('../config/constants');
const config = require('../config/config')();
const path = require('path');

// Doesn't work to get controllers name
var getName = () => {
  return path.basename(__filename).replace(/\.\w*$/, '');
}

module.exports = {
  name: 'base',
  constants,
  config,
  extend: function(child){
    return _.extend({}, this, child);
  },
  run: (req, res, next) => {
    console.log(`"run" function has not been defined.`);
  }
};
