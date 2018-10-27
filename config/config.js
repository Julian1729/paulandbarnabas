/**
 * Handle configuration settings
 * based on environment. This is designed
 * to only be called once, in the entry file.
 */

/**
 * Grab environment, if not set
 * @type {[String]}
 */
var env = process.env.NODE_ENV || 'development';
const envVars = require('./env_vars');

if(env === 'development' || env === 'testing'){
  var config = envVars[env];
  Object.keys(config).forEach((key) => {
    process.env[key] = config[key];
  });
}
