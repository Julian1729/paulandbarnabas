const mongoose = require('./db');
const Schema = mongoose.Schema;
const {ObjectId} = require('mongodb');
const _ = require('lodash');

const Utils = require('../utils/utils');
const errors = require('../errors');

/**
* Subdocument Schemas
*/

  var note_schema = new Schema({
   by: {
     type: Schema.Types.Mixed,
     required: true
   },
   note: {
     type: String,
     required: true
   }
  });

  var householder_schema = new Schema({
    name: {
      type: String,
      required: true
    },
    email: String,
    phone_number: String,
    gender: {
      type: String,
      required: true
    }
  });

  var visit_schema = new Schema({
    householders_contacted: {
      type: [String],
      required: true
    },
    contacted_by: {
      type: String,
      required: true
    },
    nowcalledon: {
      type: Boolean,
      default: false
    },
    details: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      required: true
    }
  });

  var subunit_schema = new Schema({
    name: String,
    tags: [String],
    householders: [householder_schema],
    visits: [visit_schema],
    isdonotcall: {
      type: Boolean,
      default: false
    },
    language: String,
    notes: [note_schema],
    iscalledon: {
      type: Boolean,
      default: false
    }
  });

  var unit_schema = new Schema({
    number: {
      type: Number,
      required: true
    },
    name: String,
    tags: [String],
    householders: [householder_schema],
    visits: [visit_schema],
    subunits: [subunit_schema],
    isdonotcall: {
      type: Boolean,
      default: false
    },
    language: String,
    notes: [note_schema],
    iscalledon: {
      type: Boolean,
      default: false
    }
  });


var current_holder_schema = new Schema({
  holder: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedon: {
    type: Date,
    required: true
  }
});

var worked_schema = new Schema({
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  fragment_holder: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

var block_schema = new Schema({
  hundred: {
    type: Number,
    required: true
  },
  odd: [unit_schema],
  even: [unit_schema],
  worked: [Date]
});

// STREET
var streets_schema = new Schema({
  name: {
    type: String,
    required: true
  },
  blocks: [block_schema],
  tags: [String]
});

  /**
   * Get all blocks from a street
   * @param  {String} oddOrEven 'odd' or 'even'
   * @return {Mixed} Object if includes both blocks, array if only one
   */
  streets_schema.methods.getBlocks = function(oddOrEven){
    // get blocks
    var blocks = null;
    if(oddOrEven){
      blocks = this[oddOrEven];
    }else{
      blocks = {};
      blocks.odd = this.odd;
      blocks.even = this.even;
    }
    return blocks;
  };

  // FIXME: this is wrong, it doesn't matter whether
  // the hundred is odd or even, it will have both sides
  streets_schema.methods.findBlock = function(hundred){
    hundred = parseInt(hundred);
    if(Utils.isOdd(hundred)){
      return this.odd.find(block => block.hundred === hundred);
    }
    return this.even.find(block => block.hundred === hundred);
  };



var fragment_schema = new Schema({
  number: {
    type: Number,
    required: true,
  },
  current_holder: [current_holder_schema],
  blocks: {
    type: [Schema.Types.ObjectId],
    ref: 'Territory.streets'
  },
  assignment_history: [Object],
  worked: [worked_schema]
});

  /**
   * Methods
   */

  /**
   * Add blocks to fragment
   * @param  {Array} blocks Array of blocks to add
   * @return {void}
   */
  fragment_schema.methods.addBlocks = function(blocks){
    blocks.forEach(b => {
      this.blocks.push(b._id);
    });
  };

  /**
   * Remove specified blocks from array. This method
   * casts the string id
   * @param  {Array} blocks Array of block ids to remove
   * @return {Number} Count of blocks removed
   */
  fragment_schema.methods.removeBlocks = function(blocks){
    return _.remove(this.blocks, b => {
      if (blocks.indexOf(b) !== -1) return true;
    }).length;
  };


// Parent Document Schema
var TerritorySchema = new Schema({
  congregation: Schema.Types.ObjectId,
  fragments: [fragment_schema],
  streets: [streets_schema]
});



/**
 * Plugins
 */


/**
 * Statics
 */

  /**
   * Find a territory by congregation Id
   * @param  {mixed} congregationId ObjectId object or string
   * @return {Promise}
   */
  TerritorySchema.statics.findByCongregation = function(congregationId){

   return this.findOne({congregation: congregationId})
    .then(territory => {
      if(territory === null) throw new errors.TerritoryNotFound();
      return territory;
    })
    // re throw error to be handled on other side
    .catch(e => {throw e});

  };


/**
 * Methods
 */

  TerritorySchema.methods.findBlocks = function(streetName, oddOrEven){
    // loop streets and find by name
    var streets = this.streets;
    var theStreet = null;
    for(i = 0; i < streets.length; i++){
      var street = streets[i];
      if(street.name === streetName){
        theStreet = street;
      }
      break;
    }
    if (theStreet === null) return null;
    // get blocks
    var blocks = null;
    if(oddOrEven){
      blocks = theStreet[oddOrEven];
    }else{
      blocks = {};
      blocks.odd = theStreet.odd;
      blocks.even = theStreet.even;
    }
    return blocks;
  };

  /**
   * Find street by name inside territory.
   * If street is not found, StreetNotFound will be thrown.
   * @param  {String} streetName
   * @return {Object}            [description]
   */
  TerritorySchema.methods.findStreet = function(streetName){

    var street = this.streets.find(s => s.name === streetName);
    if(!street) throw new errors.StreetNotFound(`"${streetName}" not found in Territory with congregation id ${this.congregation}`);
    return street;

  };

  /**
   * Check whether a street already exists
   * @return {mixed} True if street exists, or false if not
   */
  TerritorySchema.methods.streetExists = function(streetName){
    var street = this.streets.find(s => s.name === streetName);
    return street ? true : false;
  }

  /**
   * Append a new street into territory street array
   * @param  {String} streetName Street name
   * @param  {Object} options    Optional options object. skipExistenceCheck will skip
   * checking if the street already exists.
   * @return {Object} Return newly casted subdocument
   */
  TerritorySchema.methods.addStreet = function(streetName, options){

    options = options || {};

    // only check if street exists if skip option isn't passed in
    if(!options.skipExistenceCheck || options.skipExistenceCheck === false){
      if (this.streetExists(streetName)){
        throw new errors.StreetAlreadyExists(streetName);
      }
    }

    var newStreet = {
      name: streetName
    };

    this.streets.push(newStreet);

    // return the new street
    return this.streets[(this.streets.length - 1)];

  }

  /**
   * Find a fragment by its number.
   * @param  {Number} number Fragment's unique number;
   * @return {Object} Fragment sub document
   */
  TerritorySchema.methods.findFragment = function(number){

    var fragment = this.fragments.find(f => f.number === parseInt(number));
    if(!fragment) throw new errors.FragmentNotFound(`"${number}" not found in Territory with congregation id ${this.congregation}`);
    return fragment;

  };

  /**
   * Search through territory fragments
   * and see if number already exists
   * @param {Number} Number Fragment number
   * @return {Boolean} True if exists false if not
   */
  TerritorySchema.methods.fragmentNumberExists = function(number){
    var fragment = this.fragments.find(f => f.number === parseInt(number));
    return (fragment) ? true : false;
  };

  /**
   * Remove a fragment from territory
   * array by number
   * @param  {Number} number
   * @return {Boolean} True on at least one fragment removed. False on 0
   */
  TerritorySchema.methods.removeFragment = function(number){
    var removed = _.remove(this.fragments, f => {
      return f.number === number;
    });
    return (removed.length > 0) ? true : false;
  };

  /**
   * Assign a block to a congregation fragment
   * @param  {mixed} fragmentNumber Unique fragment number (e.g 15)
   * @param  {mixed} blockId Block ObjectId
   * @return {Promise}
   */
  TerritorySchema.methods.assignBlockToFragment = function(fragmentNumber, blockId){

    var fragment = this.findFragment(fragmentNumber);
    // assure block isnt' already inside fragment
    var alreadyExists = fragment.blocks.find(block => block.equals(blockId));
    if(alreadyExists) return this;
    fragment.blocks.push(blockId);
    return this.save();

  }

  /**
   * Loop through all fragments
   * and assure that blocks have already been
   * assigned to other fragments.
   * @param  {Array} blocksArray Array of blocks to check against blocks
   * @return {mixed} Return Array of already assigned blocks and the fragment they belong to or null
   */
  TerritorySchema.methods.areBlocksAssigned = function(blocksArray){

    var map = this.blockMap();

    var alreadyAssignedBlocks = [];

    // loop through all fragments
    this.fragments.forEach(f => {
      // loop through blocks
      f.blocks.forEach(b => {
        // search for block id in blockMap and cache in var
        var result = map[b._id.toString()] || null;
        if(result !== null){
          // create info object
          var info = _.merge({block: b._id}, result);
          alreadyAssignedBlocks.push(info);
        }
      });
    });

    return alreadyAssignedBlocks;

  };

  /**
   * create map of blockIds to the fragment they belong to
   * to be easily accessed
   * @return {Object} e.g. { '123ObjectId12424' : 2 } (objectId : FragmentNumber)
   */
  TerritorySchema.methods.blockMap = function(){

    var map = {};
    this.fragments.forEach(f => {
      f.blocks.forEach(b => {
        map[b._id] = {fragment_number: f.number, fragment_id: f._id};
      });
    });
    return map;

  };

  /**
   * Enter a new fragment into
   * @param  {Object} fragmentObj Fragment data object
   * @param  {Object} options Options object. (overwriteFragment, overwriteBlocks)
   * @return {Promise}
   */
  TerritorySchema.methods.saveFragment = function(fragmentObj, options){
    options = options || {};
    if(fragmentObj.number === undefined){
      throw new Error('Fragment number must be defined');
    }
    // assure that fragment number doesn't already exist
    if (this.fragmentNumberExists(fragmentObj.number)){
      // should fragment be overwritten?
      if(!options.overwriteFragment){
        throw new errors.FragmentNumberAlreadyExists(fragmentObj.number);
      }
      // overwrite old fragment => delete old fragment
      this.removeFragment(fragmentObj.number)
    }
    // assure that blocks do not belong to other fragments
    var assignedBlocks = this.areBlocksAssigned(fragmentObj.blocks);
    if(assignedBlocks.length > 0){
      // this is only allowed if overwriteFragment or overwriteBlocks
      // options are passed in
      if(!options.overwriteFragment || !options.overwriteBlocks){
        throw new errors.BlocksAlreadyAssignedToFragment(assignedBlocks);
      }
      // remove blocks from other fragments
      this.removeBlocksFromFragments(assignedBlocks);
    }
    // push into fragments array
    this.fragments.push(fragmentObj);
  };

  /**
   * Remove unassign specified blocks from their
   * assigned fragments
   * @param  {Object} blockMap Results from are blocks assigned e.g. {block: 'asdfasd', fragment_id: 'asdfasdf', fragment_number: 'sdfsdf'}
   * @return {Number} Count of blocks removed
   */
  TerritorySchema.methods.removeBlocksFromFragments = function(blockMap){
    var fragmentMap = {};
    var removedCount = 0;
    // create fragment map
    blockMap.forEach(map => {
      if(!fragmentMap[map.fragment_number]){
        fragmentMap[map.fragment_number] = [];
      }
      fragmentMap[map.fragment_number].push(map.block);
    });
    // loop through fragments and find in territory
    for (var number in fragmentMap) {
      if (fragmentMap.hasOwnProperty(number)) {
        // pick fragment by number and pass in blocks to remove
        // removedCount += this
        //   .findFragment(number)
        //   .removeBlocks(fragmentMap[number]);
          var fragment = this.findFragment(number);
          console.log('fragment', fragment);
          console.log('to remove', fragmentMap[number]);
          removedCount += fragment.removeBlocks(fragmentMap[number]);
      }
    }
    return removedCount;
  };



/**
 * Export
 */
var Territory = mongoose.model('Territory', TerritorySchema);

module.exports = Territory;
