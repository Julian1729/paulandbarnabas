/**
 * Manage Publishers Page Javascript
 */
const $ = require('../../jquery/jquery');

var error_modals = require('../modules/generic_modals');

/**
 * DOM Elements
 */
var CACHED_ELEMENTS = {
  $publisher_selector: $('select[name="publisher_id"]'),
  $assigned_fragments_table: $('#assigned-fragments-table'),
  $unassigned_fragments_table: $('#unassigned-fragments-table')
};

var $assigned_fragments_pbtable = CACHED_ELEMENTS.$assigned_fragments_table.pbtable();
var $unassigned_fragments_pbtable = CACHED_ELEMENTS.$unassigned_fragments_table.pbtable();

/**
 * Populate Streets in selector on page load
 */
(function($selector){

  $selector.populateusers();

}(CACHED_ELEMENTS.$publisher_selector));

/**
 * Populate Unassigned Fragments table
 */
(function($unassigned_pbtable, $assigned_table){

  $unassigned_pbtable.rowClick(function(r){
    $row = $(r);
    $row.attr('data-new', true)
    $row.appendTo($assigned_table)
  });

  $.ajax({
    url: window.PB_CONSTANTS.ajax_url + '/territory/get-unassigned-fragments',
    method: 'POST',
    success: function(r){
      if(r.error){
        return error_modals.page_error_modal.show();
      }
      var rowInfo = [];
      r.data.forEach(function(fragment){
        rowInfo.push({
          rowAttrs: {'data-fragment': fragment.id, 'class': 'selectable'},
          values: [fragment.number, fragment.block_count],
        });
      });
      console.log(rowInfo);
      $unassigned_pbtable.appendRows(rowInfo);
    },
    error: function(){
      error_modals.request_error_modal.show();
    }
  });

}($unassigned_fragments_pbtable, CACHED_ELEMENTS.$assigned_fragments_table));

/**
 * Populate Assigned Fragments Table
 */
(function(cached){

  function morphTable(r){
    if(response.error){
      return error_modals.request_error_modal.show();
    }

  }

  function populateAssignedFragments(){
    var userId = $(this).val();

    $.ajax({
      url: window.PB_CONSTANTS.ajax_url + '/territory/get-assigned-fragments',
      success: morphTable,
      error: function(){
        error_modals.request_error_modal.show()
      }
    });
  }

  cached.$publisher_selector.on('change', populateAssignedFragments);


}(CACHED_ELEMENTS))
