/**
 * Attach all plugins to jQuery object and return modified jQuery
 */

var $ = require('jquery');

/**
 * Plugins
 */
 var AjaxForm = require('./plugins/ajaxform');
 $.fn.ajaxform = AjaxForm;

 var DisableInputs = require('./plugins/disableInputs');
 $.fn.disableinputs = DisableInputs;

 var PopulateStreetNames = require('./plugins/populatestreetnames');
 $.fn.populatestreetnames = PopulateStreetNames;

 var PopulateFragments = require('./plugins/populatefragments');
 $.fn.populatefragments = PopulateFragments;

 var PopulateUsers = require('./plugins/populateusers');
 $.fn.populateusers = PopulateUsers;

module.exports = $;
