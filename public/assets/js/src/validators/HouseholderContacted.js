var validate = require('validate.js');
const _ = require('lodash');

const HouseholderContactedContraints = {

  'householders.contacted': {
    presence: {
      allowEmpty: false,
      message: 'Please select or add the housholder who was contacted'
    },
  },

  'publisher.name': {
    presence: {
      allowEmpty: false,
      message: 'Please provide the name of the publisher who spoke to the householder'
    },
  },

  // 'publisher.returning': {
  //   presence: {
  //     allowEmpty: false,
  //     message: 'Please specify whether or not the publisher will be returning on householder'
  //   },
  // },

  'visit.details': {
    presence: {
      allowEmpty: false,
      message: 'Please provide at least a brief summary of the visit'
    },
  },

  'visit.date': {
    presence: {
      allowEmpty: false,
      message: 'Please provide the date this visit took place'
    },
  },

  'visit.time': {
    presence: {
      allowEmpty: false,
      message: 'Please provide the time this visit took place'
    },
  }

};

module.exports = function(formData){ return validate(formData, HouseholderContactedContraints, {fullMessages: false}) };
