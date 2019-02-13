var $ = require('jquery');
const _ = require('lodash');

$container = $('#modal-overlay');

var Modal = function(options){
  return new Modal.init(this, options);
};

Modal.init = function(modal, options){

  options = options || {};

  self = this;

  self.modal = modal;

  _.defaults(options, {
    vars: {},
    positiveAction: defaultButtonAction,
    negativeAction: defaultButtonAction,
    nuetralAction: defaultButtonAction,
    onClose: defaultButtonAction,
    closeable: true
  });

  self.options = options;

  if(!$container.length) throw new Error('No modal container found');

  // cache buttons
  var buttons = {
    positive: modal.find('button[data-action="positive"]'),
    negative: modal.find('button[data-action="negative"]'),
    neutral: modal.find('button[data-action="neutral"]'),
    close: modal.find('button[data-action="close"]')
  };

  // attach handlers
  if(buttons.positive.length){
    buttons.positive.click(function(){ options.positiveAction(modal); });
  }
  if(buttons.negative.length){
    buttons.negative.click(function(){ options.negativeAction(modal); });
  }
  if(buttons.neutral.length){
    buttons.neutral.click(function(){ options.neutralAction(modal); });
  }
  if(buttons.close.length){
    buttons.close.click(function(){ closeModal.call(self) });
  }

  /**
   * If outside of modal clicked, close modal if
   * closeable option is true
   */
  $container.click(function(e){
    if(options.closeable === true){
      if(e.target.matches('#modal-overlay')){
        closeModal.call(self);
      }
    }
  });


};

/**
 * Default button action to avoid action undefined
 * @return {[type]} [description]
 */
function defaultButtonAction(){
  throw new Error('No action function assigned to this button');
};

/**
 * Add 'show' class to modal overlay
 * @return {void} [description]
 */
function showOverlay(){
  $container.addClass('show');
}

/**
 * Remove show class from modal overlay
 * @return {void} [description]
 */
function hideOverlay(){
  $container.removeClass('show');
}

/**
 * Display overlay and show modal
 * @param  {DOMElement} modal Optionally pass in modal
 * @return {void}
 */
function showModal(modal){
  modal = this.modal || modal;
  showOverlay();
  modal.addClass('show');
}

/**
 * Close modal and overlay
 * @param  {DOMElement} modal Optionally pass in modal
 * @return {void}
 */
function closeModal(modal){
  modal = this.modal || modal;
  modal.removeClass('show');
  setTimeout(hideOverlay, 400);
  if(this.options && this.options.onClose){
    this.options.onClose(modal);
  }
}

Modal.prototype = {

  show: showModal,

  close: closeModal

};

Modal.init.prototype = Modal.prototype;

module.exports = Modal;
