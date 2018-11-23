const ti = require('../modules/text-input.js');
const $ = require('jquery');
const _ = require('lodash');
const validate = require('validate.js');

const form2js = require('../../vendor/form2js');
const {getTemplate} = require('../modules/template.js');
const GenerateUnitsValidation = require('../validators/GenerateUnits');
const {simpleHandler, clearErrors} = require('../modules/validationHandler.js');

/**
 * DOM Elements
 */
var form = $('#create-territory-form');
var unitContainer = $('.units-container');
var panes = {
  createblock: $('#createblock')
};


/**
 * Attach handlers
 */
 form.submit(function(e){
   e.preventDefault();
   var $form = $(this); // cast form element to jquery object
   collectData(this);
 });


// function collectData(form){
//   // WARNING: this cannot be a jquery object
//   // collect form data with form2js
//   var formData = form2js(form);
// }

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
(function(){

  /**
   * Function to be fired on generate
   * units 'click' event
   */
  function eventHandler(e){
    // clear form errors
    clearErrors($('#createblock'));
    // get form values
    var formData = form2js('createblock');
    var validation = GenerateUnitsValidation(formData);
    if(validation) return simpleHandler(validation);
    // validate that generation values correspond to "odd or even" selection
      var odd_or_even = (formData.odd_even === 'odd') ? 'odd' : 'even';
      // validate constraints
      var constraints = {numericality : {}};
      constraints.numericality[odd_or_even] = true;
      var mergedResults = {};
      // from
      _.merge(mergedResults, validate(_.pick(formData, 'generate_from'), {generate_from: constraints}));
      // to
      _.merge(mergedResults, validate(_.pick(formData, 'generate_to'), {generate_to: constraints}));
      if(mergedResults) return simpleHandler(mergedResults);
  }

  $('#generate-units').click(eventHandler);

}());
