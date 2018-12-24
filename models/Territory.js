const mongoose = require('./db');
const Schema = mongoose.Schema;
const {ObjectId} = require('mongodb');

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
  units: [unit_schema],
  worked: [Date]
});

// STREET
var streets_schema = new Schema({
  name: {
    type: String,
    required: true
  },
  odd: [block_schema],
  even: [block_schema],
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

  streets_schema.methods.findBlock = function(hundred){
    if(Utils.isOdd(hundred)){
      return this.odd.find(block => block.hundred === hundred);
    }
    return this.even.find(block => block.hundred === hundred);
  };



var fragment_schema = new Schema({
  number: {
    type: Number,
    required: true
  },
  current_holder: [current_holder_schema],
  blocks: {
    type: [Schema.Types.ObjectId],
    ref: 'Territory.streets'
  },
  assignment_history: [Object],
  worked: [worked_schema]
});



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

  TerritorySchema.methods.findFragment = function(number){

    var fragment = this.fragments.find(f => f.number === parseInt(number));
    if(!fragment) throw new errors.FragmentNotFound(`"${number}" not found in Territory with congregation id ${this.congregation}`);
    return fragment;

  };

  /**
   * Assign a block to a congregation fragment
   * @param  {mixed} fragmentNumber Unique fragment number (e.g 15)
   * @param  {mixed} blockId Block ObjectId
   * @return {Promise}
   */
  TerritorySchema.methods.assignBlockToFragment = function(fragmentNumber, blockId){

    var fragment = this.findFragment(fragmentNumber);
    fragment.blocks.push(blockId);
    return this.save();

  }


/**
 * Export
 */
var Territory = mongoose.model('Territory', TerritorySchema);

module.exports = Territory;
