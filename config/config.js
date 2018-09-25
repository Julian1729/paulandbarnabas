// OPTIMIZE: Just make these enviornmental variables as oppose to accessing the config file
// to access a var
var config = {
  'development' : {
    mode: 'development',
    port: 3000,
    base_url: "http://localhost:3000",
    mongo: {
      url: 'localhost',
      port: 27017,
      db_name: 'PaulAndBarnabas'
    }
  },
  'testing' : {
    mode: 'testing',
    port: 3000,
    base_url: "http://localhost:3000",
    mongo: {
      url: 'localhost',
      port: 27017,
      db_name: 'PaulAndBarnabasTesting'
    }
  },
  'production' : {
    mode: 'production'
  }
};

module.exports = function(mode){
  return config[mode || process.env.NODE_ENV || 'development'];
}
