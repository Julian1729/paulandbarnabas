/**
 * Utility Functions
 */

const bcrypt = require('bcrypt');
const _ = require('lodash');

const clearCollection = (model) => {

  return model.deleteMany({});

};

const collectFormData = (fields, req) => {
  var formData = {};

  for (var i = 0; i<fields.length; i++) {
    // pass null if field is undefined
    var key = fields[i];
    // OPTIMIZE: always pulling data from body
    // possibly give option to pull from another object
    if(req.body[key] === undefined){
      formData[key] = null;
    }else{
      formData[key] = req.body[key];
    }

  }

  return formData;

};

const bcryptPassword = passwordString => {

  return bcrypt.hash(passwordString, 10);

};

const camelCase = (string, delimiter) => {

  // default delimiter to hyphen (-)
  delimiter = delimiter || '-';
  // split string
  var splits = string.split(delimiter);
  var camelCaseString = '';
  // if unable to split return og string
  if(!splits.length) return string;
  // take first string, convert to lowercase and insert into string
  var first = splits.shift().toLowerCase();
  camelCaseString += first;
  // capitalize remaining and concat to string
  splits.forEach(str => {
    camelCaseString += _.capitalize(str);
  });
  return camelCaseString;

};

const pascualCase = (string, delimiter) => {

  // default delimiter to hyphen (-)
  delimiter = delimiter || '-';
  // split string
  var splits = string.split(delimiter);
  var PascualCaseString = '';
  splits.forEach(str => {
    PascualCaseString += _.capitalize(str);
  });
  return PascualCaseString;

};

module.exports = {
  clearCollection,
  collectFormData,
  bcryptPassword,
  camelCase,
  pascualCase
};
