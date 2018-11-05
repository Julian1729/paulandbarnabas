/**
 * Main Js File
 */
const $ = require('jquery');

 function fileSelect(){
   // get body class name
   var classList = $('body').attr('class').split(/\s+/);
   console.log(classList);
 }

 fileSelect();
