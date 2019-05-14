/**
 * Territory - Unit Overview Page
 */

  const $ = require('jquery');

  const w$ = window.jQuery;

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
      error: w$('#bootstrap-error-modal')
    }
  };

  /**
   * Unit Options
   */

  // Add tag
  (function(btn, modal){

    // Button
    if(!btn) return;

    // show modal when option button clicked
    btn.on('click', function (){
      modal.modal('show');
    });

    // Modal
    var $saveBtn = $('#add-tag-submit-btn');
    var $tagForm = $('#add-tag-form');
    var $errorContainer = $tagForm.find('.form-errors');
    var $tagInput = $tagForm.find('input[name=tag]');

    $saveBtn.on('click', submit);

    function submit(){

      // get info
      var tag = $tagInput.val();
      if(tag.length === 0 || null){
        return $errorContainer.append('<div class="alert alert-danger" role="alert">Please enter a valid tag</div>');
      }
      // send request
      sendData(tag)
        .done(function(r){

          // refresh page
          window.location.reload(false);

        })
        .fail(function(){

          // show error modal
          DOM_CACHE.modals.error.modal('show');

        });

    }

    function sendData(tag){

      var url = window.unitOptions.tags.add.endpoint;
      url += '?tag=' + encodeURIComponent(tag);
      return $.ajax({
        url: url,
        type: 'POST'
      });

    }

  }(DOM_CACHE.options.add_tag, DOM_CACHE.modals.add_tag));
