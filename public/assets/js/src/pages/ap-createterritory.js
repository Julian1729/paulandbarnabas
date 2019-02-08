const _ = require('lodash');

const $ = require('../../jquery/jquery');
const ti = require('../modules/text-input.js');
const validate = require('validate.js');
const form2js = require('../../vendor/form2js');
const Utils = require('../../utils');
const {getTemplate, getTextTemplate} = require('../modules/template.js');
const GenerateUnitsValidation = require('../validators/GenerateUnits');
const {simpleHandler, clearErrors} = require('../modules/validationHandler.js');

/**
 * DOM Elements
 */
var form = $('#create-territory-form');
var panes = {
  streetselect: $('#streetselect'),
  createblock: $('#createblock'),
  units: $('#units'),
  fragmentassignment: $('#fragmentassignment')
};
var unitContainer = panes.units.find('.units-container');

/**
 * Street Statistics Table Module
 */
(function(g){

  var StreetStatsTable = {

    $table: $('#existing-blocks-table'),

    $empty_message: $('#no-blocks-found'),

    clear: clear,

    empty_message: {
      hide: function(){
        StreetStatsTable.$empty_message.addClass('hide');
      },
      show: function(){
        StreetStatsTable.$empty_message.removeClass('hide');
      }
    },

    populate: populate

  };

  /**
   * Populate table with rows
   * @param {Object} streetData Response from ajax call
   * @return {void}
   */
  function populate(streetData){
    var rowElements = generateRows(streetData);
    rowElements.forEach(function(row){
      console.log(this);
      this.$table.append(row);
    }, this);
  }

  /**
   * Copy row template and add appropriate classes
   * @param  {Object} hundreds
   * @return {Array} Array of generated row elements
   * OPTIMIZE: add unit counts to table if > 0
   */
  function generateRows(streetData){
    var elements = [];
    streetData.forEach(function(hundred){
      var $row = $('#existing-row-template').clone();
      // remove default hide class
      $row.removeClass('hide');
      $row.addClass('existing-block-tr');
      $row.find('.hundred').text(hundred.hundred);
      if(hundred.unit_counts.odd > 0){
        $row.find('td.odd').addClass('filled');
      }
      if(hundred.unit_counts.even > 0){
        $row.find('td.even').addClass('filled');
      }
      elements.push($row);
    });
    return elements;
  }

  /**
   * Clear table of all rows
   * @return {void}
   */
  function clear(){
    this.$table.find('tr.existing-block-tr').remove();
  }

  g.StreetStatsTable = StreetStatsTable;

}(window));

/**
 * Existing Blocks Loader
 */
(function(table){

  var $streetSelect = $('#street_selector');

  /**
   * Attach Handler
   */
  $streetSelect.change(refreshTable);

  function refreshTable(streetName){
    var $this = $(this);
    var $selectElement = $this.find('select');
    var street = $selectElement.val();
    if(Utils.isEmptyString(street)) return false;

    // change street label
    $('.street-label').text(street);
    $.ajax({
      url: '/ajax/territory/get-street-stats',
      method: 'post',
      data: {
        street: street
      },
      success: morphTable
    });
  }

  function morphTable(ajaxResponse){
    if(ajaxResponse.error){
      // FIXME: pop error modal
      return console.log('HANDLE THIS ERROR!', ajaxResponse.error);
    }
    // clear out old rows
    table.clear();
    // re-hide message
    table.empty_message.hide();
    var streetData = ajaxResponse.data
    if(!streetData){
      return table.empty_message.show();
    }
    table.populate(streetData);
  }



}(window.StreetStatsTable));

/**
 * Form Submission and data collection
 */
(function(form){
  /**
   * Attach handlers
   */
   form.submit(function(e){
     e.preventDefault();
     var $form = $(this); // cast form element to jquery object
     var formData = collectData(this);
     // send to backend
     formData = JSON.stringify(formData);
     $.ajax({
       url: '/ajax/territory/save-territory',
       method: 'POST',
       contentType: 'application/json',
       dataType: 'json',
       data: formData,
       success: function(response){
         console.log(response);
       }
     });
   });

  /**
   * Collect form data, along with unit data
   * @param  {HTMLElement} form Node to collect data from
   * @return {Object}
   */
  function collectData(form){
    // WARNING: form cannot be a jquery object
    var formData = form2js(form);
    // append unit data
    formData.units = collectUnitData();
    // convert to json to send
    return formData;
  }

  /**
   * Extract all data from generated units
   * @return {Array} Unit data array
   */
  function collectUnitData(){

    // collect all units inside unit container
    var units = unitContainer.find('.unit');
    var collectedUnits = [];
    units.each(function(){
      var dataObj = {};
      // convert to jquery object
      var $this = $(this);
      // retrieve number
      dataObj.number = $this.data('number');
      // collect all subunit data
      var subunitData = form2js($this.find('.subunit-container')[0], '.', false);
      // merge into data obj
      dataObj = _.merge(dataObj, subunitData);
      // push into collectedUnits
      collectedUnits.push(dataObj);
    });
    return collectedUnits;

  }

}(form, unitContainer));

/**
 * Unit UI
 */
(function(unitContainer){

  function unitEventHandler(e){
    // add subunit button
    if( e.target.matches('.unit img.add') ){
      // get input text template
      var template = getTemplate('.subunit');
      ti.attachEvents(template);
      return $(e.target).parent().parent().find('.subunit-container').append(template);
    }

    // remove unit button
    if( e.target.matches('.unit img.remove') ){
      // find unit
      var unit = e.target.closest('.unit');
      // remove
      unit.parentElement.removeChild(unit);
    }

  }

  unitContainer.on('click', unitEventHandler);

}(unitContainer));

/**
 * Generate Units
 */
(function(panes, unitContainer){

  /**
   * DOM Elements
   */
  var unitColOne = unitContainer.find('.units-column.one');
  var unitColTwo = unitContainer.find('.units-column.two');

  var unitPaneHundred = panes.units.find('p.details span.hundred');
  var unitPaneStreetName = panes.units.find('p.details span.name')
  /**
   * Function to be fired on generate
   * units 'click' event
   */
  function eventHandler(e){
    // clear form errors
    clearErrors($('#createblock'));
    // get form values
    var formData = form2js('createblock');
    // validate
    var validation = GenerateUnitsValidation(formData);
    if(validation) return simpleHandler(validation);
    // start unit generation
      // clean out all units in container OPTIMIZE: ask before doing so
      unitColOne.html('');
      unitColTwo.html('');
      // change pane details
      changePaneDetails(formData.block_hundred);
      // generate units
      var units = generateUnits(formData.generate_from, formData.generate_to, formData.odd_even);
      var firstColumnCount = units.length / 2;
      // populate first column
      for(i=0; i < firstColumnCount; i++){
        unitColOne.append(units.shift());
      }
      // populate second column with remaining units
      units.forEach(function(unit){
        unitColTwo.append(unit);
      });
  }

  function changePaneDetails(hundred){
    console.log('hundred', hundred);
    unitPaneHundred.text(hundred);
  }

  /**
   * Create unit html elements.
   * @param  {Number} from Number to start at
   * @param  {Number} to Number to generate to
   * @param  {String} odd_or_even Whether odd or even
   * @return {Array} Array of units
   */
  function generateUnits(from, to, odd_or_even){
    var unitNumbers = [];
    if(odd_or_even === 'even'){
      for(var i = from; i <= to; i++){
        if(i % 2 === 0){
          unitNumbers.push(i);
        }
      }
    }else if(odd_or_even === 'odd'){
      for(var i = from; i <= to; i++){
        if(i % 2 !== 0){
          unitNumbers.push(i);
        }
      }
    }
    var units = [];
    unitNumbers.forEach(function(number){
      var template = getTemplate('.unit');
      template.data('number', number);
      template.find('span.number').text(number);
      units.push(template);
    });
    return units;
  }

  $('#generate-units').click(eventHandler);

}(panes, unitContainer));

/**
 * Create street button
 */
(function(pane){

  /**
   * DOM Elements
   */
  var button = pane.find('#createstreetbtn');
  var streetInput = pane.find('#new_street_name');
  var streetSelector = pane.find('#street_selector');
  var existingBlocks = pane.find('.existing-blocks');

  function eventHandler(e){
    streetInput.toggleClass('hide');
    streetInput.disableinputs(null, true);
    streetSelector.toggleClass('disabled');
    streetSelector.disableinputs();
    existingBlocks.toggleClass('hide');
  }

  /**
   * Attach Events
   */
  button.on('click', eventHandler);

}(panes.streetselect));

/**
 * Populate fragment holders on page load
 */
(function(pane){

  var $selector = pane.find('select[name=fragment_assignment]');
  $selector.populatefragments();

}(panes.fragmentassignment));

/**
 * Populate Streets in selector on page load
 */
(function(pane){

  var $selector = pane.find('select[name=street]');
  $selector.populatestreetnames(true);

}(panes.streetselect));
