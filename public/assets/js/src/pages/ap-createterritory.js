const $ = require('jquery');
const _ = require('lodash');

const ti = require('../modules/text-input.js');
const validate = require('validate.js');
const form2js = require('../../vendor/form2js');
const {getTemplate} = require('../modules/template.js');
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


(function(form){

/**
 * Attach handlers
 */
 form.submit(function(e){
   e.preventDefault();
   var $form = $(this); // cast form element to jquery object
   collectData(this);
 });


function collectData(form){
  // WARNING: form cannot be a jquery object
  var formData = form2js(form);
  //var units = collectUnitData();
  //var blockData = _.merge(formData, units);

  // append unit data
  formData.units = collectUnitData();
  // convert to json to send
  formData = JSON.stringify(formData);

  // send to backend
  $.ajax({
    url: '/ajax/create-territory',
    method: 'POST',
    contentType: 'application/json',
    dataType: 'json',
    data: formData,
    success: function(response){
      console.log(response);
    }
  });
}

/**
 * Get data from generated units
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
      // generate units
      var units = generateUnits(formData.generate_from, formData.generate_to, odd_or_even);
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

  function eventHandler(e){
    streetInput.toggleClass('hide');
    streetInput.disableinputs(null, true);
    streetSelector.toggleClass('disabled');
    streetSelector.disableinputs();
  }

  /**
   * Attach Events
   */
  button.on('click', eventHandler);

}(panes.streetselect));
