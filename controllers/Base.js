_ = require('lodash');

module.exports = {
  name: "base",
  extend: function(child){
    return _.extend({}, this, child);
  },
  run: (req, res, next) => {
    console.log(`"run" function has not been defined.`);
  }
};
