
const TerritoryModels = require('../models/Territory');
const Session = require('../session/session');
const logger = require('../utils/logger');
const HttpStatus = require('http-status-codes');
const controllerBase = require('./base');

var land = (req, res, next) => {

  var user = Session.pickUserCredentials(req.session);

  //send number of fragment
  //send number of units
  var renderVars = {
    'dashboard_stats': {
      fragment_count: 0,
      unit_count: 0
    },
    'fragments': [],
  };

  TerritoryModels.findByCongregation(user.congregation)
    .then(territory => {

      var fragments = territory.findUserFragments(user.user_id);
      fragments.forEach(f => {
        // e.g. {number: 1, id: 'asdfasd', last_worked: (timestamp), block_count: 12, unit_count: 123}
        var fragmentStats = {
          number: null,
          id: null,
          assigned_on: null,
          last_worked: null,
          block_count: null,
          unit_count: 0
        };
        fragmentStats.number = f.number;
        fragmentStats.id = f._id;
        fragmentStats.assigned_on = _.last(f.assignment_history).on,
        fragmentStats.last_worked = _.last(f.worked);
        fragmentStats.block_count = f.blocks.length;
        // find blocks
        var blocks = territory.findBlocksById(f.blocks);
        // get unit count from block
        blocks.forEach(b => {
          fragmentStats.unit_count += b.block.units.length
        });
        // construct var object
        renderVars.fragments.push(fragmentStats);
      });
      return territory;
    })
    .then(territory => {

      // create dashboard stats
      renderVars.fragments.forEach(stat => {
        renderVars.dashboard_stats.fragment_count++;
        renderVars.dashboard_stats.unit_count += stat.unit_count;
      })
      console.log( JSON.stringify(renderVars, null, 2) );
      res.render('Dashboard', renderVars);

    })
    .catch(e => {
      console.log(e);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });



};

module.exports = controllerBase.extend({
  land
});
