/**
 * Handle configuration settings
 * based on environment. This is designed
 * to only be called once, in the entry file.
 */

// discern execution environment
const env = process.env.NODE_ENV || 'development';
const envVars = require('./env_vars');

if(env === 'development' || env === 'test'){
  let config = envVars[env];
  Object.keys(config).forEach((key) => {
    process.env[key] = config[key];
  });
}
