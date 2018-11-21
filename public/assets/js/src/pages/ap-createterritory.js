const ti = require('../modules/text-input.js');
const $ = require('jquery');
const form2js = require('../../vendor/form2js.js');
const {getTemplate} = require('../modules/template.js');

/**
 * DOM Elements
 */
var form = $('#create-territory-form');
var templates = {
  subunit: $('#templates .subunit')
};


/**
 * Attach handlers
 */
 form.submit(function(e){
   e.preventDefault();
   var $form = $(this); // cast form element to jquery object
   collectData(this);
 });


function collectData(form){
  // WARNING: this cannot be a jquery object
  // collect form data with form2js
  var formData = form2js(form);
}

/**
 * Unit UI
 */
(function(templates){

  /**
   * DOM Elements
   */
  var unitContainer = $('.units-container');

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

}(templates))
