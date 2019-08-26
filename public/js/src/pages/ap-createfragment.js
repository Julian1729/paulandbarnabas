const _ = require('lodash');
const Mustache = require('mustache');

const form2js = require('../../vendor/form2js');
const $ = require('../../jquery/jquery');
const error_modals = require('../modules/generic_modals');
const {simpleHandler, clearErrors} = require('../modules/validationHandler.js');
require('../modules/text-input');

/**
 * Cache Prominent DOM Elements
 */
var DOM = {
  $fragment_form: $('#fragment-form'),
  $fragment_assignment_selector: $('select[name="fragment.assignment"]'),
  $street_selector: $('select[name=current_street_selection]'),
  $fragment_display: $('.fragment-display-wrapper'),
  $block_table_wrapper: $('#block-table'),
  $fragment_number_input: $('input[name="fragment.number"]'),
  $submit_button: $('#save-fragment')
};

/**
 * Street Selector
 */
(function(g, $selector){

  $selector.change(sendToTable);

  /**
   * Check for and handle error,
   * delegate rest of action to table module
   * @param  {Object} response Response from ajax request
   */
  function sendToTable(){
    var selectedStreet = $(this).val();
    g.Table.update(selectedStreet);
  }

}(window, DOM.$street_selector));

/**
 * Table Module
 */
(function(g, selectedStreet){

  var $table = $('table.select-blocks');
  var $emptyMessage = $('#table-empty-message');

  var Table = {

    currentStreet: null,

    blocks: {},

    update: update,

    reset: reset

  };

  /**
   * Bind events using event delegation
   */

  // Row click
  $table.on('click', 'tr:not(:first-of-type)', rowClick);

  /**
   * Event fired on row click
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  function rowClick(e){
    var $row = $(this);
    var blockReference = $row.data('blockReference');
    // check if block has already been selected
    if( Fragment.blockSelected(blockReference.id) ){
      // deselect block
      Fragment.removeBlock(Table.currentStreet, blockReference);
      $row.removeClass('selected')
    }else{
      // Add selected class
      $row.addClass('selected');
      Fragment.addBlock(Table.currentStreet, blockReference);
    }
  }

  /**
   * Populate table with rows
   * @param  {Object} blocks Blocks response
   */
  function update(streetName){
    Table.reset();
    // find street
    var street = _.find(localized.streets, ['name', streetName]);
    if(!street){
      return console.error('No hundreds found for street');
    }
    Table.currentStreet = streetName;
    var rows = generateRows(street.stats);
    hideEmptyMessage();
    $table.append(rows);
  }

  /**
   * Create table row with block data
   * @param  {[type]} odd_even [description]
   * @param  {[type]} block    [description]
   * @return {[type]}          [description]
   */
  function createRow(odd_even, hundred, unitCount, blockId){
    var element = $('<tr>');
    var info = element.clone();
    info.hundred = hundred;
    info.odd_even = odd_even;
    info.id = blockId;
    info.units = unitCount;
    element.data('blockReference', info);
    // create tds
    element.append( $('<td>').text(hundred) );
    element.append( $('<td>').text(_.capitalize(odd_even)) );
    element.append( $('<td>').text(unitCount) );
    element.addClass('selectable');
    // check if block exists
    if( Fragment.blockSelected(blockId) ){
      element.addClass('selected');
    }
    return element;
  }

  /**
   * Generate jQuery element rows with block
   * data for even and odd
   * @param  {Array} even Even blocks array
   * @param  {Array} odd  Odd blocks array
   * @return {Array} Array of Jquery elements
   */
  function generateRows(stats){
    var rows = [];
    var hundreds = stats.hundreds;
    for (var hundred in hundreds) {
      if (hundreds.hasOwnProperty(hundred)) {
        var stats = hundreds[hundred];
        rows.push(createRow('odd', hundred, stats.odd_count, stats.odd_id));
        rows.push(createRow('even', hundred, stats.even_count, stats.even_id));
      }
    }
    return rows;
  }

  function showEmptyMessage(){
    $emptyMessage.removeClass('hide');
  }

  function hideEmptyMessage(){
    $emptyMessage.addClass('hide');
  }

  /**
   * Clear all rows from table
   */
  function reset(){
    Table.currentStreet = null;
    $table.find('tr:not(:first-of-type)').remove();
    showEmptyMessage();
  }

  // Expose Table and Fragment Modules to window
  g.Table = Table;

}(window));

/**
 * Expose Fragment object to window
 */
(function(g, $fragment_display){

  // hold fragment data
  // {'Oakland': {blocks: [{hundred: 4500, odd_even: 'even', units: 34, id: '#blk_(id...)'], id: '#str_Oakland'}}
  var fragmentData = {};

  var $blockCounter = $('#fragment-block-count');
  var $unitCounter = $('#fragment-unit-count');
  var $fragmentNumber = $('#fragment-number');
  var $emptyMessage = $fragment_display.find('p.empty-message');
  var $diplayContainer = $fragment_display.find('.container');

  var Fragment = {

    number: function(number){
      $fragmentNumber.text(number);
    },

    addBlock: function(streetName, block){

      // get current street from table
      if(fragmentData[streetName] === undefined){
        // create street record
        createStreetReference(streetName);
      }
      var streetReference = fragmentData[streetName];
      var blockReference = constructBlockReference(block);
      // create block reference
      streetReference.blocks.push(blockReference);
      addToDisplay(streetName, blockReference);

    },

    removeBlock: function(streetName, blockReference){

      var blocks = fragmentData[streetName].blocks;
      // find block and remove
      var removedBlockReference = _.remove(blocks, ['id', blockReference.id]);
      // if no blocks remain remove street entry
      if(fragmentData[streetName].blocks.length === 0) delete fragmentData[streetName];
      if(!removedBlockReference) return console.error('Unable to remove block w/ id ' + blockReference.id);
      removeFromDisplay(streetName, removedBlockReference[0]);

    },

    blockSelected: function(blockId){

      for (var street in fragmentData) {
        if (fragmentData.hasOwnProperty(street)) {
          var street = fragmentData[street];
          if(_.find(street.blocks, ['id', blockId])){
            return true;
          }
        }
      }

      return false;

    },

    export: function(){

      var blockArray = [];

      for (var street in fragmentData) {
        if (fragmentData.hasOwnProperty(street)) {
          var blockIds = fragmentData[street].blocks.map(function(blockReference){
            return blockReference.id;
          });
          blockArray = blockArray.concat(blockIds);
        }
      }

      return blockArray;

    },

  };

  function constructBlockReference(block){
    return {
      hundred: block.hundred,
      odd_even: block.odd_even,
      id: block.id,
      units: block.units,
      blockElementId: '#blk_' + block.id,
    };
  }

  function createStreetReference(streetName){
    fragmentData[streetName] = {
      blocks: [],
      streetElementId: '#str_' + streetName,
    };
  }

  /**
   * Delete a block from fragment UI
   * @param  {Number} id Block Id
   * @return {void}
   */
  function removeFromDisplay(streetName, blockReference){
    // find block element
    var $blockElement = $('#' + getBlockElementId(blockReference.id));
    if(!$blockElement.length) return;
    $blockElement.remove();
    // check if street element is empty
    if(!fragmentData[streetName]){
      // remove empty street element
      $('#' + getStreetElementId(streetName)).remove();
      // check if any streets remain in data
      if(Object.keys(fragmentData).length === 0){
        // fragment empty, display empty message
        showEmptyMessage();
      }
    }
    subtractFromCount(blockReference.units);
  }

  /**
   * Add a block to fragment UI,
   * and add entire group if street
   * doesn't already exist
   * @param {[type]} block [description]
   */
  function addToDisplay(streetName, blockReference){
    // remove hidden message if not hidden
    hideEmptyMessage();
    // find street element
    var $streetElement = $('#' + getStreetElementId(streetName));
    // if street doesnt exist, create block group
    if( !$streetElement.length ){
      $streetElement = createStreetElement(streetName);
      $diplayContainer.append( $streetElement );
    }
    var $blockContainer = $streetElement.find('.blocks');
    var $block = createBlockElement(blockReference);
    $blockContainer.append($block);
    addToCount(blockReference.units);
  }

  function getStreetElementId(streetName){
    return 'str_' + streetName;
  }

  function getBlockElementId(blockId){
    return 'blk_' + blockId;
  }

  /**
   * Create block row element with
   * all block data attahed.
   * @param  {Object} block Block details
   * @return {jQuery} Created block row element
   */
  function createBlockElement(block){
    // get template
    var template = $('#temp-block-row').html();
    var rendered = Mustache.render(template, {
      hundred: block.hundred,
      odd_even: block.odd_even,
    });
    // convert to jQuery object
    $block = $.parseHTML(rendered);
    $block = $($block[0]);
    $block.attr('id', getBlockElementId(block.id));
    $block.data('id', block.id);
    $block.data('hundred', block.hundred);
    $block.data('odd_even', block.odd_even);
    return $block;
  }

  /**
   * Create block group container
   * with street name and id attached
   * @param  {Object} current_street Currently selected street from Table
   * @return {jQuery} Created jquery element
   */
  function createStreetElement(streetName){
    var template = $('#temp-street-group').html();
    Mustache.parse(template);
    var rendered = Mustache.render(template, {street: streetName});
    // convert to jquery object
    $streetElement = $.parseHTML(rendered);
    // add data
    var $streetElement = $($streetElement[0]);
    $streetElement.data('name', streetName);
    $streetElement.attr('id', getStreetElementId(streetName));
    return $streetElement;
  }

  /**
   * Subtract units from unit counter and
   * one block from block counter
   * @param  {Number} units Number of units to subtract from count
   */
  function subtractFromCount(units){
    var unitCount = parseInt($unitCounter.text()) - units;
    // this function is to be called when 1 block
    // is removed, always to remove 1 block
    var blockCount = parseInt($blockCounter.text()) - 1;
    // reenter into elements
    $unitCounter.text(unitCount);
    $blockCounter.text(blockCount);
  }

  /**
   * Subtract units from unit counter and
   * one block from block counter
   * @param  {Number} units Number of units to subtract from count
   */
  function addToCount(units){
    var newUnitCount = parseInt($unitCounter.text()) + units;
    // this function is to be called when 1 block
    // is removed, always to remove 1 block
    var newBlockCount = parseInt($blockCounter.text()) + 1;
    // reenter into elements
    $unitCounter.text(newUnitCount);
    $blockCounter.text(newBlockCount);
  }

  function hideEmptyMessage(){
    $emptyMessage.addClass('hide');
  }

  function showEmptyMessage(){
    $emptyMessage.removeClass('hide');
  }

  /**
   * Get sum of block row elements
   * inside of a block group
   * @param  {jQuery} $block_group Block group element
   * @return {Number} Block count
   */
  function getBlockRowCount($block_group){
    return $block_group.find('.blocks > .block').length;
  }

  g.Fragment = Fragment;

}(window, DOM.$fragment_display));

/**
 * Fragment number input
 */
(function(g, $input){

  $input.change(updateNumber);

  function updateNumber(){
    var number = $(this).val();
    Fragment.number(number);
  }

}(window, DOM.$fragment_number_input));


/**
 * Submit Fragment
 */
(function(g, $fragment_form){

  $fragment_form.submit(submit);

  function submit(e){

    e.preventDefault();
    // gather form data with form js
    var formData = _.pick( form2js($fragment_form[0]), ['fragment.number', 'fragment.assignment']);
    // if number or assignment are empty set to null
    formData.fragment = formData.fragment || {};
    // attach block data to object
    formData.fragment.blocks = Fragment.export();
    // stringify object
    var json = JSON.stringify(formData);
    // make ajax request
    $.ajax({
      url: localized.endpoints.save_fragment,
      method: 'post',
      contentType: 'application/json',
      data: json,
      success: ajaxSuccess,
      error: ajaxError,
    });

  }

  function ajaxError(){
    error_modals.request_error_modal.show();
  }

  function ajaxSuccess(res){

    console.log(res);
    clearErrors($fragment_form);
    if(res.error.type){
      if (res.error.type === 'FORM_VALIDATION_ERROR'){
        return simpleHandler(res.error.validationErrors);
      }
    }
    // show success modal
    $('#fragment-saved-modal').pbmodal({
      onClose: function(){
        window.location.reload(true);
      }
    })
    .show();

  }

}(window, DOM.$fragment_form));
