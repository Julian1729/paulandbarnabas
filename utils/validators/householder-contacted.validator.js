const validate = require('./base.js');
const _ = require('lodash');

const HouseholderContactedContraints = {

  'householders_contacted': {
    presence: {
      allowEmpty: false,
      message: 'Please select or add the housholder who was contacted'
    },
    length: {
      minimum: 1,
      tooShort: 'Please select or add the housholder who was contacted'
    }
  },

  'publisher': {
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

  'details': {
    presence: {
      allowEmpty: false,
      message: 'Please provide at least a brief summary of the visit'
    },
  },

  'date': {
    presence: {
      allowEmpty: false,
      message: 'Please provide the date this visit took place'
    },
  },

  'time': {
    presence: {
      allowEmpty: false,
      message: 'Please provide the time this visit took place'
    },
  }

};

module.exports = formData =>  validate(formData, HouseholderContactedContraints, {fullMessages: false});
