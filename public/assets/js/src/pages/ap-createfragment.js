const $ = require('../../jquery/jquery');
require('../modules/text-input');

var fragment = {};

/**
 * Cache Prominent DOM Elements
 */
var DOM = {
  $fragment_assignment_selector: $('select[name=assignment]'),
  $street_selector: $('select[name=current_street_selection]'),
  $fragment_display: $('.fragment-display-wrapper')
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
 * Update Fragment Data
 */
(function(g){

  /**
   * Cache DOM Elements
   */
  var $table = $('table.select-blocks');
  var $blocks = $table.find('tr:not(:first-of-type)');

  /**
   * Bind events using event delegation
   */

    // Row click
    $table.on('click', 'tr:not(:first-of-type)', rowClick);


  function rowClick(e){
    // Add selected class
      $row = $(this);
      $row.addClass('selected');
    // Extract data
      var block = $row.data('details');
      g.updateFragment(block)
  }

}(window));

/**
 * Expose fragment functions to window
 */
(function(g, data, $street_selector, $fragment_display){

  Fragment = {

    display: $fragment_display,

    updateFragment : function(blockData){
      // get textual value of street
      var streetName = $street_selector.find('option:selected').text();
      // enter block data into array
      if(data[streetName] === undefined){
        data[streetName] = [];
      }
      data[streetName].push(blockData);
      console.log(this.display);
      this.refreshFragmentDisplay();
    },

    refreshFragmentDisplay : function(){
      console.log('refreshing display...');
    }

  };

  g.Fragment = Fragment;

}(window, fragment, DOM.$street_selector, DOM.$fragment_display));
