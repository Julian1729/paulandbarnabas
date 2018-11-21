var $ = require('../../jquery/jquery.js');

var templates = $('#templates');

/**
 * [getTemplate description]
 * @param  {[type]} querySelector         [description]
 * @param  {[type]} withDataAndEvents     [description]
 * @param  {[type]} deepWithDataAndEvents [description]
 * @return {jQuery object}
 */
function getTemplate(querySelector){
  // find template
  var template = templates.find(querySelector);
  // throw error if not found
  if(template.length === 0) throw new Error('"' + querySelector + '" did not match any templates.');
  // clone and return template
  return template.clone();
}

module.exports = {
  getTemplate
};
