var config = {
  'development' : {
    port: 3000
  },
  'production' : {
    port: null
  }
};

module.exports = function(mode){
  return config[mode || 'development'] || config.development;
}
