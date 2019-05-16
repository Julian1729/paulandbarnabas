/**
 * Unit Pages Controller
 */
const moment = require('moment');
const HttpStatus = require('http-status-codes');

const TerritoryModel = require('../../models/Territory');
const Session = require('../../session/session');
const constants = require('../../config/constants');
const errors = require('../../errors');
const Utils = require('../../utils/utils');

var middleware = {};
var endpoints = {};

/**
 * Middleware
 */

middleware.findRequestedUnit = (req, res, next) => {

  let unitNumber = req.params.unit_number;

  let requested = res.locals.requested;
  let block_ref = requested.block;

  // search for unit
  let unit = null;

  try {
    unit = block_ref.block.unit(unitNumber);
  } catch (e) {
    if(e instanceof errors.UnitNotFound){
      // could not find unit
      return res.status(HttpStatus.NOT_FOUND).send();
    }
    throw e;
  }

  // attach to locals
  requested.unit = unit;

  // add global to URL Constructor
  let PBURLConstructor = res.locals.PBURLConstructor;

  PBURLConstructor.setGlobal('unit_number', unit.number);

  // attach unit render vars to locals
  let render_vars = res.locals.render_vars;
  render_vars.unit = {
    number: unit.number,
    name: unit.name,
    id: unit._id
  };

  let subunitParam = req.query.subunit || null;

  // get subunit if "subunit" GET param
  if(subunitParam){
    // search for subunit in unit
    try {
      let subunit = unit.findSubunit(subunitParam);
      // attach to locals
      requested.subunit = subunit;
      // attach unit render vars to locals
      let render_vars = res.locals.render_vars;
      render_vars.subunit = {
        name: subunit.name,
        id: subunit._id
      };
    } catch (e) {
      // send 404 if subunit not found
      if(e instanceof errors.SubunitNotFound){
       return res.status(HttpStatus.NOT_FOUND).send();
      }
      // if not delegate to main error handler
      throw e;
    }
  }



  return next();

};

/**
 * Unit Overview
 */
endpoints.overview = (req, res, next) => {

  let requested = res.locals.requested;
  let fragment = requested.fragment;
  let unit = requested.unit;
  let subunit = requested.subunit || {};

  let user = res.locals.user;

  let PBURLConstructor = res.locals.PBURLConstructor;

  let subunitQueryParam = _.isEmpty(subunit) ? {} : {'subunit' : subunit.name};

  let unitOptions = {

    tags: {
      add: {
        title: 'add tag',
        endpoint: PBURLConstructor.getRoute('add-tag').url(null, _.extend(subunitQueryParam, {'tag':'TAGHERE'})),
        id: 'option-tag-add'
      }
    },

    notes: {
      add: {
        title: 'add note',
        endpoint: PBURLConstructor.getRoute('add-note').url(null, subunitQueryParam),
        id: 'option-note-add'
      }
    },

    dnc: {
      mark: {
        title: 'mark as do not call',
        endpoint: PBURLConstructor.getRoute('mark-dnc').url(null, subunitQueryParam),
        id: 'option-dnc-mark'
      },
      unmark: {
        title: 'unmark as do not call',
        endpoint: PBURLConstructor.getRoute('unmark-dnc').url(null, subunitQueryParam),
        id: 'option-dnc-unmark'
      }
    },

    calledon: {

      mark: {
        title: 'this unit is currently being consistently visited',
        endpoint: PBURLConstructor.getRoute('mark-calledon').url(null, subunitQueryParam),
        id: 'option-calledon-mark'
      },

      unmark: {
        title: 'this unit is no longer being consistently visited',
        endpoint: PBURLConstructor.getRoute('unmark-calledon').url(null, subunitQueryParam),
        id: 'option-calledon-unmark'
      },

    },

    quicknotes: {

      ni: {
        title: 'not interested',
        endpoint: PBURLConstructor.getRoute('add-note').url(null, subunitQueryParam),
        body: {
          note: 'Householder not interested.',
          by: `${user.first_name} ${user.last_name}`
        },
        id: 'option-quicknote-ni'
      },

      busy: {
        title: 'busy, call again',
        endpoint: PBURLConstructor.getRoute('add-note').url(null, subunitQueryParam),
        body: {
          note: 'Householder busy, call again.',
          by: `${user.first_name} ${user.last_name}`
        },
        id: 'option-quicknote-busy'
      }

    }

  };

  let validOptions = [
    unitOptions.tags.add,
    unitOptions.notes.add,
    (subunit.isdonotcall || unit.isdonotcall ? unitOptions.dnc.unmark : unitOptions.dnc.mark),
    (subunit.iscalledon || unit.iscalledon ? unitOptions.calledon.unmark : unitOptions.calledon.mark),
    unitOptions.quicknotes.ni,
    unitOptions.quicknotes.busy
  ];

  // add timestamp to notes
  let notes = subunit.notes || unit.notes;
  notes.map(note => {
    note.timestamp = note._id.getTimestamp();
    return note;
  });

  let renderVars = {
    options: validOptions,
    unitOptions,
    subunit: _.isEmpty(subunit) ? false : true,
    street: requested.block.street,
    hundred: requested.block.hundred,
    number: unit.number,
    name: subunit.name || unit.name,
    tags: subunit.tags || unit.tags,
    householders: subunit.householders || unit.householders,
    visits: subunit.visits || unit.visits,
    notes,
    isdonotcall: subunit.isdonotcall || unit.isdonotcall,
    calledon: subunit.iscalledon || unit.iscalledon,
    language: subunit.language || unit.language,
    householder_contacted_url: PBURLConstructor.getRoute('unit-add-visit').url(null, subunitQueryParam)
  };

  res.render('Territory/UnitOverview', renderVars);

};

/**
 * Householder Contacted
 */
endpoints.householderContacted = (req, res) => {

  let territory = res.locals.territory;
  let requested = res.locals.requested;
  let unit = requested.unit;
  let subunit = requested.subunit || {};

  let PBURLConstructor = res.locals.PBURLConstructor;

  let street = requested.block.street;
  let hundred = requested.block.hundred;

  let subunitQueryParam = _.isEmpty(subunit) ? null : {'subunit': subunit.name};

  let renderVars = {
    rajax_add_visit_url: PBURLConstructor.getRoute('add-visit').url(null, subunitQueryParam),
    rajax_add_householder_url: PBURLConstructor.getRoute('add-householder').url(null, subunitQueryParam),
    subunit: _.isEmpty(subunit) ? false : true,
    householders: unit.householders.map(h => _.pick(h, 'name', 'gender')),
    number: unit.number,
    unit_overview_url: PBURLConstructor.getRoute('unit-overview').url(),
    street
  };

  res.render('Territory/UnitHouseholderContacted', renderVars);

};

module.exports = {endpoints, middleware};
