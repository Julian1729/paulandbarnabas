const _ = require('lodash');
const Mustache = require('mustache');

const form2js = require('../../vendor/form2js');
const $ = require('../../jquery/jquery');
const error_modals = require('../modules/generic_modals');
const {simpleHandler, clearErrors} = require('../modules/validationHandler.js');
require('../modules/text-input');

// OPTIMIZE: when blocks are inserted into block groups, sort them numerically


/**
 * Global Vars
 */

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
 * Populate Select Element w/ users
 */
(function($selector){

  $selector.populateusers();

}(DOM.$fragment_assignment_selector));

/**
 * Populate select elemts w/ streets
 */
(function($selector){

  $selector.populatestreetnames();

}(DOM.$street_selector));

/**
 * Fragment number input
 */
(function(g, $input){

  $input.change(updateNumber);

  function updateNumber(){
    var number = $(this).val();
    g.Fragment.number.update(number);
  }

}(window, DOM.$fragment_number_input));

/**
 * Expose Fragment object to window
 */
(function(g, $street_selector, $fragment_display){

  /**
   * e.g data['wakeling'] = [{hundred: 4600, odd_even: 'odd', units: 17, id: '1324234'}];
   * @type {Object}
   */
  var data = {}

  Fragment = {

    number: {

      value: 0,

      $element: $('#fragment-number'),

      update: function(number){
        this.value = number;
        this.$element.text(this.value);
      }

    },

    $container: $fragment_display.find('.container'),

    $block_counter: $('#fragment-block-count'),

    $unit_counter: $('#fragment-unit-count'),

    empty_message: {

      hidden: false,

      $element: $fragment_display.find('.empty-message'),

      hide: function(){
        this.$element.addClass('hide');
        this.hidden = true;
      },

      show: function(){
        this.$element.removeClass('hide');
        this.hidden = false;
      }

    },

    /**
     * Return raw fragment data.
     * Not to be used to submit to server
     * @return {Object} [description]
     */
    getData: function(){
      return data;
    },

    /**
     * Get only necessary data from data object.
     * To be used to submit to server.
     * @return {Array} Array of objects containing street data.
     */
    export: function(){
      var formattedData = [];
      for (var streetName in data) {
        if (data.hasOwnProperty(streetName)) {
          var blocks = data[streetName];
          // if street is empty skip
          if(blocks.length === 0) return;
          var streetData = {};
          streetData.name = streetName;
          streetData.blocks = [];
          blocks.forEach(function(block){
            block = _.pick( block, ['hundred', 'odd_even', 'id'] );
            streetData.blocks.push(block);
          });
          formattedData.push(streetData);
        }
      }
      return formattedData;
    },

    /**
     * Update fragment stats by probing
     * data object
     */
    refreshCounts: function(){
      var blockCount = 0;
      var unitCount = 0;
      for (var street in data) {
        if (data.hasOwnProperty(street)) {
          var blocks = data[street];
          // add blocks to count
          blockCount += blocks.length;
          blocks.forEach(function(block){
            // add unit count to total
            unitCount += block.units;
          });
        }
      }
      // update UI elements
      this.$block_counter.text(blockCount);
      this.$unit_counter.text(unitCount);
    },

    /**
     * Front function to update fragment data
     * @param  {Object} blockData Block data
     * @return {[type]}           [description]
     */
    addBlock : function(blockData){
      var streetName = g.Table.current_street.name;
      // enter block data into array
      if(data[streetName] === undefined){
        data[streetName] = [];
      }
      data[streetName].push(blockData);
      addToDisplay(blockData);
    },

    removeBlock: function(id){
      var streetName = g.Table.current_street.name;
      // find block
      var idMap = data[streetName].map(function(b){ return b.id });
      data[streetName].splice( idMap.indexOf(id) );
      removeFromDisplay(id);
    },

    /**
     * Check if a certain block has already been selected
     * @return {boolean} True if block already selected
     */
    blockSelected: function(street, blockId){

      var streetArray = data[street];
      if(!streetArray) return false;
      for (var i = 0; i < streetArray.length; i++) {
        var block = streetArray[i];
        if(block.id === blockId) {
          return true;
        }
      }
      return false;

    },

    /**
     * Print Data
     * @return {void}
     */
    print: function(){
      console.log(data);
    }

  };

  /**
   * Delete a block from fragment UI
   * @param  {Number} id Block Id
   * @return {void}
   */
  function removeFromDisplay(id){
    $block_group = findBlockGroupById(g.Table.current_street.id);
    if(getBlockRowCount($block_group) == 1){
      // street only has one block, remove entire group
      $block_group.remove();
    }else{
      $block = findBlockRow($block_group, id);
      $block.remove();
    }
    // if there are no more block groups, display empty message
    if(getAllBlockGroups().length === 0){
      Fragment.empty_message.show();
    }
    Fragment.refreshCounts();
  }

  /**
   * Add a block to fragment UI,
   * and add entire group if street
   * doesn't already exist
   * @param {[type]} block [description]
   */
  function addToDisplay(block){
    // remove hidden message if hidden
    if(!Fragment.empty_message.hidden){
      Fragment.empty_message.hide();
    }
    // find block group
    $block_group = findBlockGroupById(g.Table.current_street.id);
    // if street doesnt exist, create block group
    if( !$block_group.length ){
      $block_group = createBlockGroup(g.Table.current_street);
      Fragment.$container.append( $block_group );
    }
    $block_container = $block_group.find('.blocks');
    var $block = createBlockElement(block);
    $block_container.append($block);
    Fragment.refreshCounts();
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
  function createBlockGroup(current_street){
    // get template
    var template = $('#temp-block-group').html();
    var variables = {
      street: current_street.name
    };
    Mustache.parse(template);
    var rendered = Mustache.render(template, variables);
    // convert to jquery object
    $block_group = $.parseHTML(rendered);
    // add data
    var $block_group = $($block_group[0]);
    $block_group.data('name', current_street.name);
    $block_group.data('id', current_street.id);
    return $block_group;
  }

  /**
   * Search all block groups in fragment container
   * and filter by passed in street id
   * @param  {[type]} id [description]
   * @return {[type]}    [description]
   */
  function findBlockGroupById(id){
    var $block_group = getAllBlockGroups().filter(function(){
      return $(this).data('id') == g.Table.current_street.id;
    });
    return $block_group;
  }

  /**
   * Get all block groups
   * @return {jQuery} All found block groups
   */
  function getAllBlockGroups(){
    var $all_block_groups = Fragment.$container.find('.block-group');
    return $all_block_groups;
  }

  /**
   * Find a block row inside
   * of a block group by id
   * @param  {jQuery} $block_group Block group element
   * @param  {Number} id Block id
   * @return {jQuery} Found block id
   */
  function findBlockRow($block_group, id){
    $block = $block_group.find('.blocks > .block').filter(function(){
      return $(this).data('id') == id;
    })
    return $block;
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

}(window, DOM.$street_selector, DOM.$fragment_display));

/**
 * Table Module
 */
(function(g){

  var Table = {

    $table: $('table.select-blocks'),

    current_street: null,

    blocks: {},

    populate: populate,

    clear: clear

  };

  /**
   * Bind events using event delegation
   */

  // Row click
  Table.$table.on('click', 'tr:not(:first-of-type)', rowClick);

  /**
   * Event fired on row click
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  function rowClick(e){
    $row = $(this);
    var block = $row.data('details');
    // check if block has already been selected
    if( g.Fragment.blockSelected(Table.current_street.name, block.id) ){
      // deselect block
      g.Fragment.removeBlock(block.id);
      $row.removeClass('selected')
    }else{
      // Add selected class
      $row.addClass('selected');
      // Extract data
      g.Fragment.addBlock(block)
    }
  }

  /**
   * Populate table with rows
   * @param  {Object} blocks Blocks response
   */
  function populate(stats){
    Table.clear();
    var rows = generateRows(stats);
    Table.$table.append(rows);
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
    element.data('details', info);
    // create tds
    element.append( $('<td>').text(hundred) );
    element.append( $('<td>').text(_.capitalize(odd_even)) );
    element.append( $('<td>').text(unitCount) );
    // check if block exists
    if( g.Fragment.blockSelected(g.Table.current_street.name, blockId) ){
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

    var dataObj = {
      hundred: null,
      odd_even: null,
      units: null,
      id: null
    };

    stats.forEach(function(hundred){
      rows.push(createRow('odd', hundred.hundred, hundred.unit_counts.odd, hundred.odd_id));
      rows.push(createRow('even', hundred.hundred, hundred.unit_counts.even, hundred.even_id));
    });

    return rows;

  }

  /**
   * Clear all rows from table
   */
  function clear(){
    this.$table.find('tr:not(:first-of-type)').remove();
  }

  g.Table = Table;

}(window));

/**
 * Street Selector
 */
(function(g, $, $selector){

  current_street =  {name: null, id: null};

  $selector.change(ajaxRequest);

  /**
   * Check for and handle error,
   * delegate rest of action to table module
   * @param  {Object} response Response from ajax request
   */
  function sendToTable(response){
    g.Table.current_street = current_street;
    if(response.error){
      console.log('HANDLE THIS ERROR!');
    }
    g.Table.populate(response.data);
  }

  /**
   * Called on selector change, make ajax request
   * to server and call sendToTable on success
   */
  function ajaxRequest(){
    // get textual value of street
    var streetName = $selector.find('option:selected').text();
    current_street.name = streetName;
    current_street.id = $selector.val();
    $.ajax({
      url: g.PB_CONSTANTS.ajax_url + '/territory/get-street-stats',
      method: 'post',
      data: {
        street: streetName
      },
      success: sendToTable
    });
  }

}(window, $, DOM.$street_selector));

/**
 * Submit Fragment
 */
(function(g, cache){

  var $form = cache.$fragment_form;
  $form.submit(submit);

  function submit(e){
    e.preventDefault();
    // gather form data with form js
    var fragmentObj = _.pick( form2js(cache.$fragment_form[0]), ['fragment.number', 'fragment.assignment']);
    // if number or assignment are empty set to null
    fragmentObj.fragment = fragmentObj.fragment || {};
    // attach block data to object
    fragmentObj.fragment.data = g.Fragment.export();
    // stringify object
    var json = JSON.stringify(fragmentObj);
    // make ajax request
    $.ajax({
      url: g.PB_CONSTANTS.ajax_url + '/territory/save-fragment',
      method: 'post',
      contentType: 'application/json',
      data: json,
      success: success,
      error: function(){
        error_modals.request_error_modal.show();
      }
    });
  }

  function success(response){
    clearErrors(cache.$fragment_form);
    if(response.error){
      if (response.error.name === 'FormValidationError'){
        return simpleHandler(response.error.validationErrors);
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

}(window, DOM));
