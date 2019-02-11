/**
 * Modal API
 */

const $ = require('jquery');

var activeModal = null;

var Modal = {

  $overlay: $('#modal-overlay'),

  show: show,

  close: close

};

function show(id){
  var modal = $(id);
  if(!modal.length){
    throw new Error('Modal with id ' + id + ' not found');
  }
  activeModal = modal;
  showOverlay();
  activeModal.addClass('show');
}

function close(){
  activeModal.removeClass('show');
  setTimeout(hideOverlay, 400);
}

function showOverlay(){
  Modal.$overlay.addClass('show');
}

function hideOverlay(){
  Modal.$overlay.removeClass('show');
}

module.exports = Modal;
