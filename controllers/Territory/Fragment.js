const HttpStatus = require('http-status-codes');

const controllerBase = require('../base');
const TerritoryModel = require('../../models/Territory');
const UserModel = require('../../models/User');
const Session = require('../../session/session');
const constants = require('../../config/constants');
const errors = require('../../errors');
const Utils = require('../../utils/utils');

/**
 * Show fragment overview, blocks
 */
var land = (req, res, next) => {

  var user = Session.pickUserCredentials(req.session);
  var fragmentId = req.params.fragment_id;

  var renderVars = {
    // Oakland: {id: 'asdfasdf', blocks: {hundred: 4700, odd_even: 'even'}}
    fragment_id: req.params.fragment_id,
    // work_url: constants.fragment_url + "/work/" + fragment_id
    work_url: `${constants.fragment_url}/${req.params.fragment_id}/blocks/`,
    streets: {}
  };

  TerritoryModel.findByCongregation(user.congregation)
    .then(territory => {

      // OPTIMIZE: this should have been included in the fragment methods
      var fragment = territory.fragments.id(fragmentId);
      if(!fragment){
        throw new errors.FragmentNotFound()
      }
      console.log(`fragment #${fragment.number} found`);
      console.log(`fragment block ${JSON.stringify(fragment.blocks, null, 2)}`);
      var blocks = territory.findBlocksById(fragment.blocks);
      //console.log( 'blocks found', JSON.stringify(blocks, null, 2) )
      blocks.forEach(b => {
        if(!renderVars.streets[b.street]){
          renderVars.streets[b.street] = {
            blocks: []
          };
        }
        renderVars.streets[b.street].blocks.push({
          hundred: b.hundred,
          odd_even: b.odd_even,
        });
      });

      console.log( JSON.stringify(renderVars, null, 2) );
      res.render('Fragment/Overview', renderVars);

    })
    .catch(e => {
      console.log(e);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });


};

/**
 * List Blocks
 */
var blockSelect = (req, res, next) => {

    var user = Session.pickUserCredentials(req.session);
    var fragmentId = req.params.fragment_id;

    var base_block_url = function(fragment_id, block_id){
      return `${constants.fragment_url}/${fragmentId}/blocks/${block_id}`;
    }

    var renderVars = {
      fragment_id: req.params.fragment_id,
      fragment_number: null,
      // e.g. {street: Oakland, hundred: 4500, odd_even: 'even', id: 'sskskd' }
      blocks: []
    };

    TerritoryModel.findByCongregation(user.congregation)
      .then(territory => {

        // OPTIMIZE: this should have been included in the fragment methods
        var fragment = territory.fragments.id(fragmentId);
        renderVars.fragment_number = fragment.number;
        if(!fragment){
          throw new errors.FragmentNotFound()
        }
        var blocks = territory.findBlocksById(fragment.blocks);
        // add url to each block obj
        renderVars.blocks = blocks.map(b => {
          b.block.url = base_block_url(fragmentId, b.block._id);
          return b;
        });
        res.render('Fragment/BlockSelect', renderVars);

      })
      .catch(e => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      });

};

/**
 * List Units
 */
var block = (req, res, next) => {

  // construct url
  function unit_url(fragmentId, blockId, streetName, hundred, unitNumber){
    // /:fragment_id/work/:block_id/:street_name/:hundred/:unit_number'
    return `${constants.fragment_url}/${fragmentId}/blocks/${blockId}/unit/${unitNumber}`
  }

  var user = Session.pickUserCredentials(req.session);
  var fragmentId = req.params.fragment_id;
  var blockId = req.params.block_id;

  // var base_unit_url = function(fragment_id, block_id){
  //   return `${constants.fragment_url}/${fragmentId}/work/${block_id}`;
  // }

  var renderVars = {
    fragment_id: req.params.fragment_id,
    // e.g. {street: Oakland, hundred: 4500, odd_even: 'even', id: 'sskskd' }
    block_ref: {},
    unit: []
  };

  TerritoryModel.findByCongregation(user.congregation)
    .then(territory => {

      // OPTIMIZE: this should have been included in the fragment methods
      var fragment = territory.fragments.id(fragmentId);
      if(!fragment){
        throw new errors.FragmentNotFound()
      }
      var block = null;
      try{
        block = territory.findBlocksById([blockId]);
      }catch(e){
        console.log(e);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
      }
      block[0].block.units.map = block[0].block.units.map(u => {
        u.url = unit_url(fragmentId, blockId, block[0].street, block[0].hundred, u.number);
      });
      renderVars.block_ref = block[0];
      console.log( JSON.stringify(renderVars, null, 2) );
      res.render('Fragment/Block', renderVars);

    })
    .catch(e => {
      console.log(e);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });

};

module.exports = controllerBase.extend({
  land,
  blockSelect,
  block
});
