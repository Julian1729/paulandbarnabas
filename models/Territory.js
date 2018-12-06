const mongoose = require('./db');
const Schema = mongoose.Schema;


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

var streets_schema = new Schema({
  name: {
    type: String,
    required: true
  },
  odd: [block_schema],
  even: [block_schema],
  tags: [String]
});

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



/**
 * Parent document schema
 */
var TerritorySchema = new Schema({
  congregation: Schema.Types.ObjectId,
  fragments: [fragment_schema],
  streets: [streets_schema]
});

/**
 * Plugins
 */


/**
 * Methods
 */


/**
 * Export
 */
var Territory = mongoose.model('Territory', TerritorySchema);

module.exports = Territory;
