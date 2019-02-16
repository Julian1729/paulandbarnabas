const _ = require('lodash');

var universal = {

  site_name: "Paul and Barnabas",

  version: "1.0.0",

  site_description: "Paul and Barnabas is a metropolitan territory oriented congregation territory manager for Jehovah's Witnesses."

};

var local = {
  mode: "local",
  base_url: "http://localhost:3000",
  bcrypt: {
    salt_rounds: 10
  }
};
local.assets_url = local.base_url + "/assets";
local.ajax_url = local.base_url + "/ajax";

var production = {

};

var loadConstants = () => {
  var env = process.env.NODE_ENV || 'development';
  if(env === 'development' || env === 'testing'){
    return _.extend({}, local, universal);
  }else if (env === 'production') {
    return _.extend({}, production, universal);
  }
};

module.exports = loadConstants();
