/**
 * Unit Pages Controller
 */
const HttpStatus = require('http-status-codes');

const TerritoryModel = require('../../models/Territory');
const Session = require('../../session/session');
const errors = require('../../errors');
const Utils = require('../../utils/utils');

// exports.overview = (req, res, next) => {
//   res.send(`Hello from Unit controller`);
// };

/**
 * Unit Overview
 */
exports.overview = (req, res, next) => {

  var user = Session.pickUserCredentials(req.session);
  var fragmentId = req.params.fragment_id;
  var street_name = req.params.street_name;
  var hundred = req.params.hundred;
  var unit_number = req.params.unit_number;

  console.log(JSON.stringify(req.params, null, 2));

  // var base_unit_url = function(fragment_id, block_id){
  //   return `${constants.fragment_url}/${fragmentId}/work/${block_id}`;
  // }

  var renderVars = {
    fragment_id: req.params.fragment_id,
    // e.g. {street: Oakland, hundred: 4500, odd_even: 'even', id: 'sskskd' }
    block_ref: {},
    unit: {}
  };

  TerritoryModel.findByCongregation(user.congregation)
    .then(territory => {

      // OPTIMIZE: this should have been included in the fragment methods
      var fragment = territory.fragments.id(fragmentId);
      if(!fragment){
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
        throw new errors.FragmentNotFound();
      }
      // find block by id
      var block = territory.findBlocksById([req.params.block_id])[0];
      // populate block ref
      renderVars.block_ref = block;
      var unit = hundred.findUnit(req.params.unit_number);
      // determine odd or even from unit number
      if(Utils.isOdd(unit_number)){
        renderVars.block_ref.odd_even = 'odd';
      }else{
        renderVars.block_ref.odd_even = 'even';
      }
      // attach unit to render variables
      renderVars.unit = unit;
      console.log( JSON.stringify(renderVars, null, 2) );
      res.render('Fragment/Unit', renderVars);

    })
    .catch(e => {
      console.log(e);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });

};
