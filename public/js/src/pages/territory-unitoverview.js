/**
 * Territory - Unit Overview Page
 * es6
 */

const $ = require('jquery');
const _ = require('lodash');
const {EventEmitter} = require('events');
const {reloadPage} = require('../../utils');

const w$ = window.jQuery; // front end jquery

/**
 * Cached DOM Elements
 */
const DOM_CACHE = {
  options: {
    add_tag: $('#option-tag-add'),
    add_note: $('#option-note-add'),
    dnc_mark: $('#option-dnc-mark'),
    dnc_unmark: $('#option-dnc-unmark'),
    calledon_mark: $('#option-calledon-mark'),
    calledon_unmark: $('#option-calledon-unmark'),
    quicknotes_ni: $('#option-quicknote-ni'),
    quicknotes_busy: $('#option-quicknote-busy')
  },
  modals: {
    add_tag: w$('#add-tag-modal'),
    add_note: w$('#add-note-modal'),
    error: w$('#bootstrap-error-modal'),
    buttons: {
      submit_tag: $('#add-tag-submit-btn'),
      submit_note: $('#add-note-submit-btn'),
    }
  },
  forms: {
    add_tag: w$('#add-tag-form'),
  }
};

function showErrorModal(){
  DOM_CACHE.modals.error.modal('show');
}


// unit options event emitter
let UnitOptionEvents = new EventEmitter();

// Bind events to unit buttons
for (let option in DOM_CACHE.options) {
  if (DOM_CACHE.options.hasOwnProperty(option)) {
    DOM_CACHE.options[option].on('click', function(){
      // emit select
      UnitOptionEvents.emit('select', this.id);
    });
  }
}

// Bind tag:add event to add tag button on modal
// DOM_CACHE.modals.buttons.submit_tag.on('click', function(){
//
//   UnitOptionEvents.emit('tag:add');
//
// });

// Bind tag:add on form submit
DOM_CACHE.modals.buttons.submit_tag.on('click', function(){

  let $btn = $(this);
  $btn.attr('disabled', true);
  UnitOptionEvents.emit('tag:add');
  $btn.removeAtr('disabled');

});

// Bind tag:add event to add tag button on modal
DOM_CACHE.modals.buttons.submit_note.on('click', function(){

  let $btn = $(this);
  $btn.attr('disabled', true);
  UnitOptionEvents.emit('note:add');
  $btn.removeAtr('disabled');

});

// Unit option select
UnitOptionEvents.on('select', function(id){

  switch (id) {
    case 'option-tag-add':
      this.emit('tag:modal:show');
      break;
    case 'option-note-add':
      this.emit('note:modal:show');
      break;
    case 'option-dnc-mark':
      this.emit('dnc:mark')
      break;
    case 'option-dnc-unmark':
      this.emit('dnc:unmark');
      break;
    case 'option-calledon-mark':
      this.emit('calledon:mark');
      break;
    case 'option-calledon-unmark':
      this.emit('calledon:unmark');
      break;
    case 'option-quicknote-ni':
      this.emit('quicknote', 'ni');
      break;
    case 'option-quicknote-busy':
      this.emit('quicknote', 'busy');
      break;
    default:
      showErrorModal();
  }

});

// Activate tag modal
UnitOptionEvents.on('tag:modal:show', function(){

  DOM_CACHE.modals.add_tag.modal('show');

});

UnitOptionEvents.on('tag:modal:hide', function(){

  DOM_CACHE.modals.add_tag.modal('hide');

});

// Add tag event
UnitOptionEvents.on('tag:add', function(tag){

  // disable button
  let $input = $('#add-tag-input')
  let newTag = $input.val();
  let $errorContainer = $('#add-tag-errors');

  // clear out errors
  $errorContainer.html('');

  if(_.isEmpty(newTag)){
    return $errorContainer.append('<div class="alert alert-danger" role="alert">Please enter a valid tag</div>');
  }

  // WARNING: this is very hacky. the url passed in from the
  // backend has "TAGHERE" hardcoded in as a query param, the now
  // known tag can then replace that string, while having the url
  // accurately constructed in the backend.
  let endpoint = unitOptions.tags.add.endpoint.replace(/TAGHERE/, newTag);
  // send ajax request
  $.ajax({
    url: endpoint,
    type: 'POST',
  })
  .done(function(r){
    $input.val('');
    // FIXME: bad UX, should close modal and add to to list w js
    reloadPage();
  })
  .fail(function(){
    UnitOptionEvents.emit('tag:modal:hide');
    showErrorModal();
  });

});

UnitOptionEvents.on('note:modal:show', function(){

  DOM_CACHE.modals.add_note.modal('show');

});

UnitOptionEvents.on('note:modal:hide', function(){

  DOM_CACHE.modals.add_note.modal('hide');

});

UnitOptionEvents.on('note:add', function(){

  let $noteInput = $('#add-note-input');
  let $byInput = $('#add-note-by');
  let $errorContainer = $('#add-note-errors');
  let note = $noteInput.val();
  let by = $byInput.val();

  if(_.isEmpty(note)){
    $errorContainer.append('<div class="alert alert-danger" role="alert">Please enter a valid note</div>');
  }
  if(_.isEmpty(by)){
    $errorContainer.append('<div class="alert alert-danger" role="alert">Please enter a name</div>');
  }
  if(_.isEmpty(note) || _.isEmpty(by) ) return;

  // construct request body to convert to JSON
  let body = {
    note: {
      note: note,
      by: by,
    }
  };

  $.ajax({
    url: unitOptions.notes.add.endpoint,
    type: 'POST',
    data: JSON.stringify(body),
    processData: false,
    contentType: "application/json"
    })
  .done(function(){
    $noteInput.val('');
    $byInput.val('');
    reloadPage();
  })
  .fail(function(){
    UnitOptionEvents.emit('note:modal:hide');
    showErrorModal();
  });

});

UnitOptionEvents.on('dnc:mark', function(){

  $.ajax({
    url: unitOptions.dnc.mark.endpoint,
    type: 'POST',
  })
  .done(reloadPage)
  .fail(showErrorModal);

});

UnitOptionEvents.on('dnc:unmark', function(){

  $.ajax({
    url: unitOptions.dnc.unmark.endpoint,
    type: 'POST',
  })
  .done(reloadPage)
  .fail(showErrorModal);

});

UnitOptionEvents.on('calledon:mark', function(){

  $.ajax({
    url: unitOptions.calledon.mark.endpoint,
    type: 'POST',
  })
  .done(reloadPage)
  .fail(showErrorModal);

});

UnitOptionEvents.on('calledon:unmark', function(){

  $.ajax({
    url: unitOptions.calledon.unmark.endpoint,
    type: 'POST',
  })
  .done(reloadPage)
  .fail(showErrorModal);

});

// set note input to predefined text and open modal
UnitOptionEvents.on('quicknote', function(type){

  let $noteInput = $('#add-note-input');

  let quicknotes = {
    ni: 'Householder stated that they were not interested.',
    busy: 'Householder was busy, but was not opposed to a visit at another time.',
  };

  this.emit('note:modal:show');

  $noteInput.val(quicknotes[type]);

});
