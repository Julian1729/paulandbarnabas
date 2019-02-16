const _ = require('lodash');

var constants = require('../../../../../config/constants');

var PB_CONSTANTS = _.cloneDeep(constants);

// remove sensitive/unnecessary constants
var unset = ['mode', 'bcrypt'];
unset.forEach(prop => {

  _.unset(PB_CONSTANTS, prop);

});

window.PB_CONSTANTS = PB_CONSTANTS;
