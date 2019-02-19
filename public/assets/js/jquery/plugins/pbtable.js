/**
 * PB Table morph module
 */
var $ = require('jquery');
const _ = require('lodash');

var PBTable = function(options){
  return new PBTable.init(this, options);
};

PBTable.init = function(table, options){
  this.table = table;
};

/**
 * Generate a row with row info
 * @param  {Object} rowInfoObj value object e.g. { rowAttrs: {data-action: "close", class: ".theclass" }, values: ['123', 'Julian'] }
 * @return {jQuery} Generated row
 */
function generateRow(rowInfoObj){
  rowInfoObj = rowInfoObj || {};
  _.defaults(rowInfoObj, {
    rowAttrs: {},
    values: []
  });
  // row to be mutated
  var row = $('<tr>');
  // add row attributes
  for (var attr in rowInfoObj.rowAttrs) {
    if (rowInfoObj.rowAttrs.hasOwnProperty(attr)) {
      row.attr(attr, rowInfoObj.rowAttrs[attr])
    }
  }
  rowInfoObj.values.forEach(function(v){
    var td = $('<td>');
    td.text(v);
    row.append(td);
  });
  return row;
}

PBTable.prototype = {

  /**
   * Take an array of row info objects with values
   * and append mutate table
   * @param  {Array} rowInfoObjArray Array of row info objects
   * @return {void}
   */
  appendRows: function(rowInfoObjArray){
    rowInfoObjArray.forEach(function(rowInfoObj){
      var row = generateRow(rowInfoObj);
      this.table.append(row);
    }, this);
  },

  /**
   * Use event delegation to attach a click
   * event to row.
   * @param  {Function} callback Callback function, passed row element
   * @return {void}
   */
  rowClick: function(callback){
    this.table.on('click', 'tr', function(e){
        callback(this);
    });
  }

};

PBTable.init.prototype = PBTable.prototype;

module.exports = PBTable;
