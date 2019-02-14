/**
 * Base Modals
 * Page error, and request error modal, that are available on every page
 */
const $ = require('../../jquery/jquery');

var page_error_modal = $('#page-error-modal').pbmodal();
var request_error_modal = $('#request-error-modal').pbmodal()

module.exports = {page_error_modal, request_error_modal};
