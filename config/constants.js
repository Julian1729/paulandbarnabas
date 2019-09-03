const _ = require('lodash');

const universal = {

  site_name: "Paul and Barnabas",

  version: "1.0.0",

  site_description: "Paul and Barnabas is a metropolitan territory oriented congregation territory manager for Jehovah's Witnesses."

};

const local = {
  mode: "local",
  base_url: "http://localhost:3000",
  // base_url: "http://192.168.1.224:3000",
  bcrypt: {
    salt_rounds: 10
  }
};

const production = {
  base_url: " https://paul-and-barnabas.herokuapp.com",
  bcrypt: {
    salt_rounds: 10
  }
};

const loadConstants = () => {
  let env = process.env.NODE_ENV || 'development';
  if(env === 'development' || env === 'test'){
    return _.extend({}, local, universal);
  }else if (env === 'production') {
    return _.extend({}, production, universal);
  }
};

module.exports = loadConstants();
