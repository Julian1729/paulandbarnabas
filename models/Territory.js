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

// OPTIMIZE: should units only be the number without the hundred and prefix the hundred later?
// e.g. "4524" => "24"
// this may be accomplished with mongoose schema getters and regex
var block_schema = new Schema({
  worked: [Date],
  units: [unit_schema],
  tags: [String]
});

// HUNDRED
var hundred_schema = new Schema({
  hundred: {
    type: Number,
    required: true
  },
  odd: block_schema,
  even: block_schema
});

  /**
   * Methods
   */

   /**
    * Get side of street (block) hundred
    * that corresponds to unit number
    * being even or odd. This does actually
    * search for the unit within the block.
    * @param  {mixed} number Strings will be parsed to Number
    * @return {Object} Unit's
    */
  hundred_schema.methods.getUnitBlock = function(number){
    number = parseInt(number);
    if(Utils.isOdd(number)){
      return this.odd;
    }else{
      return this.even;
    }
  };

  /**
   * Check whether a unit exists by unit number
   * @param  {Number} number Unit number
   * @return {Boolean} True if unit exists
   */
  hundred_schema.methods.unitExists = function(number){
    number = parseInt(number);
    var block = this.getUnitBlock(number);
    // loop through corresponding block's units for number and return boolean
    return ( _.findIndex(block.units, ['number', number]) > -1 ) ? true : false;
  };

  /**
   * Find and return a unit by number without
   * having to specify whether to look in odd or even,
   * throw error if not found.
   * @param  {mixed} number Strings will be parsed into number
   * @return {Object} Unit object
   */
  hundred_schema.methods.findUnit = function(number){
    number = parseInt(number);
    // determine whether odd or even
    var block = this.getUnitBlock(number);
    var foundUnit = _.find(block.units, ['number', number]);
    if(!foundUnit) throw new errors.UnitNotFound(number);
    return foundUnit;
  };

  /**
   * Loop through an array of unit numbers and remove them from hundred
   * @param  {Array} unitNumbers Array of unit numbers to search for and delete
   * @return {Array} Array of unit numbers that were succesfully removed
   */
  hundred_schema.methods.removeUnits = function(unitNumbers){
    var removed = [];
    unitNumbers.forEach(number => {
      var block = this.getUnitBlock(number);
      var deleted = _.remove(block.units, ['number', number]);
      removed.push(deleted.number);
    });
    return removed;
  };

  /**
   * Add an array of units to a hundred, and allocate units
   * depending on whether unit number is odd or even
   * @param  {Array} unitArray Array of unit numbers to create
   * @param  {Array} options   Object of options
   * @return {Number} Count of succesfully added units
   */
  hundred_schema.methods.addUnits = function(unitArray, options){
    options = options || {};
    // default options
    _.defaults(options, {
      overwriteDuplicates: false,
      skipDuplicates: false
    });
    // store existing units here
    var existingUnits = [];
    // store units to be entered
    var unitsToAdd = [];
    // loop through units
    unitArray.forEach(unitNumber => {
     // determine whether unit exists already
     if(this.unitExists(unitNumber)){

       if(options.overwriteDuplicates === true){
         // overwrite duplicate
         this.removeUnits([unitNumber])
       }else if(options.skipDuplicates === true) {
         // skip iteration
         return;
       }else{
        // default add to existingUnits to be thrown w/ error
        return existingUnits.push(unitNumber);
       }

      }
      // dont bother adding to unitsToAdd array if existingUnits
      // because an error will be thrown before they are even entered
      if(!existingUnits.length){
       // push unit object into units array
       unitsToAdd.push(unitNumber);
      }
    });
    // if overwrite option and skip duplicates is false throw UnitsAlreadyExist error w/ existing units
    if(existingUnits.length) throw new errors.UnitsAlreadyExist(existingUnits);
    // add new units to units array
    unitsToAdd.forEach(unitNumber => {
     this.getUnitBlock(unitNumber).units.push({
       number: unitNumber
     });
    });
    // return number of added units
    return unitsToAdd.length;
  }
  // /**
  //  * Add an array of units to a hundred, and allocate units
  //  * depending on whether unit number is odd or even
  //  * @param  {Array} unitArray Array of unit numbers to create
  //  * @param  {Array} options   Object of options
  //  * @return {Number} Count of succesfully added units
  //  */
  // hundred_schema.methods.addUnits = function(unitArray, options){
  //   options = options || {};
  //   // default options
  //   _.defaults(options, {
  //     overwriteDuplicates: false,
  //     skipDuplicates: false
  //   });
  //   // store existing units here
  //   var existingUnits = [];
  //   // store count of succesfully added units
  //   var addedUnits = 0;
  //   // loop through units
  //   unitArray.forEach(unitNumber => {
  //    var block = this.getUnitBlock(unitNumber);
  //    // determine whether unit exists already
  //    if(this.unitExists(unitNumber)){
  //      if(options.overwriteDuplicates === true){
  //        // overwrite duplicate
  //        this.removeUnits([unitNumber])
  //      }else if (options.skipDuplicates === true) {
  //        // if skipDuplicates option is true skip iteration
  //        return;
  //      } else{
  //       // add to existing units array to be thrown with error later and end iteration
  //       return existingUnits.push(unitNumber);
  //      }
  //    }
  //    // push unit object into units array
  //    block.units.push({
  //      number: unitNumber
  //    });
  //    // increment success count
  //    addedUnits++;
  //   });
  //   // if overwrite option and skip duplicates is false throw UnitsAlreadyExist error w/ existing units
  //   if(existingUnits.length && options.overwriteDuplicates === false ) throw new errors.UnitsAlreadyExist(existingUnits, addedUnits);
  //   // return number of added units
  //   return addedUnits;
  // }

// STREET
var streets_schema = new Schema({
  name: {
    type: String,
    required: true
  },
  hundreds: [hundred_schema],
  tags: [String]
});

  /**
   * Methods
   */

    /**
     * Get all hundreds from a street
     * @return
     */
    streets_schema.methods.getHundreds = function(){
      return this.hundreds;
    };

    /**
     * Search for a hundred by hundred, will throw error if not found.
     * @param  {mixed} hundred Hundred to search for, can be number or string
     * @return {mixed}
     */
    streets_schema.methods.findHundred = function(hundred){
      hundred = parseInt(hundred);
      var found = this.hundreds.find(hundredObj => hundredObj.hundred === hundred);
      if (!found){
        throw new errors.HundredNotFound(hundred);
      }
      return found;
    };

    /**
     *
     * @param  {mixed} hundred Strings will be parsed to Number
     * @return {Boolean} True if exists, false if not
     */
    streets_schema.methods.hundredExists = function(hundred){
      hundred = parseInt(hundred);
      return (_.findIndex(this.hundreds, ['hundred', hundred]) > -1 ) ? true : false;
    };

    /**
     * Add a hundred to street.
     * @param  {mixed} hundred Strings will be parsed into Number
     * @return {Object} New Hundred
     */
    streets_schema.methods.addHundred = function(hundred){
      hundred = parseInt(hundred);
      if(this.hundredExists(hundred)){
        throw new errors.HundredAlreadyExists(hundred);
      }
      var newLength = this.hundreds.push({
        hundred: hundred
      });
      return _.last(this.hundreds);
    };

    /**
     * Remove hundred from street.
     * @param  {mixed} hundred Strings will be parsed to Number;
     * @return {Boolean} True on succesful removal
     */
    streets_schema.methods.removeHundred = function(hundred){
      hundred = parseInt(hundred);
      return (_.remove(this.hundreds, ['hundred', hundred])) ? true : false;
    }

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
   * Add blocks to fragment after checking that
   * they do not belong to other fragments
   * @param  {Array} blocks Array of blocks to add
   * @return {void}
   * OPTIMIZE: check if ids are instances of ObjectId and
   * if not convert to ObjectId instance before pushing to array
   */
  fragment_schema.methods.assignBlocks = function(blocks, territory, options){
    options = options || {};
    _.defaults(options, {
      overwriteAssignments: false
    });
    // assure that blocks do not belong to other fragments
    var assignedBlocks = territory.areBlocksAssigned(blocks);
    if(assignedBlocks.length > 0){
      // this is only allowed if overwriteAssigments
      // option is true
      if( !options.overwriteAssignments ){
        throw new errors.BlocksAlreadyAssignedToFragment(assignedBlocks);
      }
      // remove blocks from other fragments
      this.removeBlocksFromFragments(assignedBlocks);
    }
    // push into fragments array
    blocks.forEach(b => {
      this.blocks.push(b);
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

  /**
   * Check if a fragment contains a block
   * @param  {mixed} blockId Block's ObjectId
   * @return {Boolean} True if block assigned
   */
  fragment_schema.methods.hasBlock = function(blockId){
    if(!blockId instanceof ObjectId && typeof blockId === 'string'){
      blockId = new ObjectId(blockId);
    }
    return ( _.findIndex(this.blocks, id => blockId.equals(id)) > -1 ) ? true : false;
  }


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
    // return the new street (last in array)
    return _.last(this.streets);
  }


  /**
   * Remove and entire street from territory
   * @param  {String} streetName Street name to remove.
   * @return {boolean} False if street unable to be removed
   */
  TerritorySchema.methods.removeStreet = function(streetName){
    var removed = _.remove(this.streets, s => s.name === streetName);
    if(removed.length){
      return true;
    }else{
      return false;
    }
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
   * Loop through all fragments
   * and assure discern whether blocks
   * have already been
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

  // /**
  //  * Enter a new fragment into
  //  * @param  {Object} fragmentObj Fragment data object
  //  * @param  {Object} options Options object. (overwriteFragment, overwriteBlocks)
  //  * @return {Promise}
  //  */
  // TerritorySchema.methods.addFragment = function(fragmentObj, options){
  //   options = options || {};
  //   _.defaults(options, {
  //     overwriteFragment: false,
  //     overwriteBlocks: false
  //   });
  //   if(fragmentObj.number === undefined){
  //     throw new Error('Fragment number must be defined');
  //   }
  //   // assure that fragment number doesn't already exist
  //   if (this.fragmentNumberExists(fragmentObj.number)){
  //     // should fragment be overwritten?
  //     if(!options.overwriteFragment){
  //       throw new errors.FragmentNumberAlreadyExists(fragmentObj.number);
  //     }
  //     // overwrite old fragment => delete old fragment
  //     this.removeFragment(fragmentObj.number)
  //   }
  //   // assure that blocks do not belong to other fragments
  //   var assignedBlocks = this.areBlocksAssigned(fragmentObj.blocks);
  //   if(assignedBlocks.length > 0){
  //     // this is only allowed if overwriteFragment or overwriteBlocks
  //     // options are passed in
  //     if(!options.overwriteFragment || !options.overwriteBlocks){
  //       throw new errors.BlocksAlreadyAssignedToFragment(assignedBlocks);
  //     }
  //     // remove blocks from other fragments
  //     this.removeBlocksFromFragments(assignedBlocks);
  //   }
  //   // push into fragments array
  //   this.fragments.push(fragmentObj);
  // };

    /**
     * Enter a new fragment into territory. Throw
     * error if fragment number already exists
     * @param  {Object} fragmentObj Fragment data object
     * @param  {Object} options Options object. (overwriteFragment, overwriteBlocks)
     * @return {Object} The newly entered fragment
     * OPTIMIZE: when fragments are overwritten all info is overwritten.
     * it may make sense to add an option to ONLY overwrite the fragments blocks
     * so as to keep the other data...does this make sense?
     */
    TerritorySchema.methods.addFragment = function(fragmentNumber, options){
      options = options || {};
      _.defaults(options, {
        overwriteFragment: false,
      });
      if(fragmentNumber === undefined){
        throw new Error('Fragment number must be defined');
      }
      // assure that fragment number doesn't already exist
      if (this.fragmentNumberExists(fragmentNumber)){
        // should fragment be overwritten?
        if(!options.overwriteFragment){
          throw new errors.FragmentNumberAlreadyExists(fragmentObj.number);
        }
        // overwrite old fragment => delete old fragment
        this.removeFragment(fragmentNumber)
      }
      // push into fragments array
      this.fragments.push({
        number: fragmentNumber
      });
      return _.last(this.fragments);
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
