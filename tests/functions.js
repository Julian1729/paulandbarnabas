

/**
 * Wipe and seed data into database
 * @param  {Function} done Done function passed in from test function
 * @param  {[type]}   variable GLobally accesible variable to bind data to
 * @return {Promise}
 */
var seedDatabase = async (done, variable) => {
  await require('../dev/seed/populate')(true);
  data = require('../dev/seed/data');
  return done();
};

module.exports = {seedDatabase};
