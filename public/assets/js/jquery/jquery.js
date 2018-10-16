/**
 * Attach all plugins to jQuery object and return modified jQuery
 */

var $ = require('jquery');

/**
 * Plugins
 */
 var AjaxForm = require('./plugins/ajaxform.js');
 $.fn.ajaxform = AjaxForm;

module.exports = $;
