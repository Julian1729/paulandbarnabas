/**
 * Fragment Controllers and Middleware;
 */
const _ = require('lodash');
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const errors = require(`${appRoot}/errors`);
const {logger, PBURLConstructor} = require(`${appRoot}/utils`);
const {TerritoryModel, UserModel} = require(`${appRoot}/models`);

/**
 * Show fragment overview, blocks
 */
exports.fragmentOverview = (req, res) => {

  // find requested fragment
  let fragment = res.locals.collected.fragment;
  let blockReferences = res.locals.collected.fragmentBlockReferences;

  let renderVars = {
    // Oakland: {id: 'asdfasdf', blocks: {hundred: 4700, odd_even: 'even'}}
    streets: {}
  };

  let blockOverViewRoute = PBURLConstructor.getRoute('block-overview');
  // set fragment number as route param for all routes
  blockOverViewRoute.setParam('fragment_number', fragment.number);

  // organize blocks by street
  blockReferences.forEach(b => {
    if(!renderVars.streets[b.street]){
      renderVars.streets[b.street] = {
        blocks: []
      };
    }
    renderVars.streets[b.street].blocks.push({
      hundred: b.hundred,
      odd_even: b.odd_even,
      tags: b.block.tags,
      overview_url: blockOverViewRoute.url({
        hundred: b.hundred,
        street_name: b.street,
        side: b.odd_even,
      }),
    });
  });

  return res.render('Territory/FragmentOverview', renderVars);

};

/**
 * List units for user selection
 */
exports.blockOverview = (req, res) => {

  let requestedHundred = req.params.hundred * 1; // cast to Number
  let requestedStreet = req.params.street_name;
  let requestedSide = req.params.side;

  let fragmentNumber = res.locals.collected.fragment.number;
  let fragmentBlocks = res.locals.collected.fragmentBlockReferences;

  // search for block in fragment blocks
  // with matching hundred, street, and side
  let block = _.find(fragmentBlocks, {hundred: requestedHundred, street: requestedStreet, odd_even: requestedSide});
  if(!block){
    logger.verbose(`${requestedHundred} ${requestedStreet} ${requestedSide} not found in fragment #${res.locals.collected.fragment.number}`);
    // OPTIMIZE: send UI communicable error, let user
    // know that this block is not assigned to this fragment
    return res.status(HttpStatus.UNAUTHORIZED).send();
  }

  let units = block.block.units;

  // begin route construction with fragment number
  let unitOverviewRoute = PBURLConstructor.getRoute('unit-overview');
  unitOverviewRoute.setParam('fragment_number', fragmentNumber);

  let formattedUnits = units.map(u => {

    // construct overview url
    unitOverviewRoute.setParam('unit_number', u.number);
    unitOverviewRoute.setParam('street_name', block.street);

    let obj = {
      number: u.number,
      id: u._id,
      overview_url: unitOverviewRoute.url(),
      subunits: [],
      visits: (u.visits.length) ? true : false,
      iscalledon: u.iscalledon,
      isdonotcall: u.isdonotcall,
      tags: u.tags
    };
    // handle subunits
    if(u.subunits){
      // loop through subunits and gather subunit name, and construct overview url
      // and push into subunits array on unit object
      u.subunits.forEach(s => {
        let subunitObj = {
          name: s.name,
          overview_url: unitOverviewRoute.url(null, {subunit: s.name}),
          visits: (s.visits.length) ? true : false,
          iscalledon: u.iscalledon,
          isdonotcall: s.isdonotcall,
          tags: s.tags
        };
        obj.subunits.push(subunitObj);
      });
    }
    return obj;
  });

  let renderVars = {
    block: {
      hundred: block.hundred,
      side: block.odd_even,
      street: block.street,
      tags: block.block.tags,
    },
    units: formattedUnits,
  };

  return res.render('Territory/BlockOverview', renderVars);

};

/**
 * Unit Overview
 */
exports.unitOverview = (req, res) => {

  let requestedUnitNumber = req.params.unit_number * 1;
  let requestedSubunitName = req.query.subunit;
  let requestedStreetName = req.params.street_name;

  let fragmentNumber = res.locals.collected.fragment.number;
  let fragmentBlocks = res.locals.collected.fragmentBlockReferences;

  // search for blocks with street in fragment blocks
  let streetBlocks = _.filter(fragmentBlocks, ['street', requestedStreetName]);
  if(!streetBlocks){
    logger.verbose(`${requestedStreetName} street not found in Fragment #${fragmentNumber}`);
    return res.status(HttpStatus.NOT_FOUND).send();
  }

  let unit = null;
  let block = null;
  streetBlocks.forEach(blockRef => {
     let foundUnit = _.find(blockRef.block.units, ['number', requestedUnitNumber]) || null;
     if(foundUnit){
       block = blockRef;
       unit = foundUnit;
       return false;
     }
  });
  if(!unit) {
    logger.verbose(`${requestedUnitNumber} unit not found in ${requestedStreetName} street`);
    return res.status(HttpStatus.NOT_FOUND).send();
  }

  let subunit = {};
  if(requestedSubunitName){
    // search for subunit
    try {
      subunit = unit.findSubunit(requestedSubunitName);
    } catch (e) {
      if(e instanceof erros.SubunitNotFound){
        logger.verbose(`${requestedSubunitName} not found in ${unit.number} ${requestedStreetName}`);
        res.status(HttpStatus.NOT_FOUND).send();
      }else{
        throw e;
      }
    }
  }

  // init an object to be passed into URLConstructor
  // as query param with subunit name
  let subunitQueryParam = subunit ? {'subunit' : subunit.name} : null;

  let unitOptions = {

    tags: {
      add: {
        title: 'add tag',
        // endpoint: PBURLConstructor.getRoute('add-tag').url(null, _.extend(subunitQueryParam, {'tag':'TAGHERE'})),
        id: 'option-tag-add'
      }
    },

    notes: {
      add: {
        title: 'add note',
        // endpoint: PBURLConstructor.getRoute('add-note').url(null, subunitQueryParam),
        id: 'option-note-add'
      }
    },

    dnc: {
      mark: {
        title: 'mark as do not call',
        // endpoint: PBURLConstructor.getRoute('mark-dnc').url(null, subunitQueryParam),
        id: 'option-dnc-mark'
      },
      unmark: {
        title: 'unmark as do not call',
        // endpoint: PBURLConstructor.getRoute('unmark-dnc').url(null, subunitQueryParam),
        id: 'option-dnc-unmark'
      }
    },

    calledon: {

      mark: {
        title: 'this unit is currently being consistently visited',
        // endpoint: PBURLConstructor.getRoute('mark-calledon').url(null, subunitQueryParam),
        id: 'option-calledon-mark'
      },

      unmark: {
        title: 'this unit is no longer being consistently visited',
        // endpoint: PBURLConstructor.getRoute('unmark-calledon').url(null, subunitQueryParam),
        id: 'option-calledon-unmark'
      },

    },

    quicknotes: {

      ni: {
        title: 'not interested',
        // endpoint: PBURLConstructor.getRoute('add-note').url(null, subunitQueryParam),
        body: {
          note: 'Householder not interested.',
          by: `${req.session.first_name} ${req.session.last_name}`
        },
        id: 'option-quicknote-ni'
      },

      busy: {
        title: 'busy, call again',
        // endpoint: PBURLConstructor.getRoute('add-note').url(null, subunitQueryParam),
        body: {
          note: 'Householder busy, call again.',
          by: `${req.session.first_name} ${req.session.last_name}`
        },
        id: 'option-quicknote-busy'
      }

    }

  };

  let validOptions = [
    unitOptions.tags.add,
    unitOptions.notes.add,
    // toggle mark and unmark as dnc based on current status
    (subunit.isdonotcall || unit.isdonotcall ? unitOptions.dnc.unmark : unitOptions.dnc.mark),
    // toggle mark and unmark as calledon based on current status
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

  // configure routes
  let householderContactedRoute = PBURLConstructor.getRoute('unit-add-visit');
  householderContactedRoute.setParam('fragment_number', fragmentNumber);
  householderContactedRoute.setParam('unit_number', unit.number);
  householderContactedRoute.setParam('street_name', block.street);

  let renderVars = {
    // OPTIMIZE: this should be shortened
    // when session api is refactored
    user: {
      first_name: req.session.first_name,
      last_name: req.session.last_name,
    },
    options: validOptions,
    unitOptions,
    subunit: _.isEmpty(subunit) ? false : true,
    street: block.street,
    hundred: block.hundred,
    number: unit.number,
    name: subunit.name || unit.name,
    tags: subunit.tags || unit.tags,
    householders: subunit.householders || unit.householders,
    visits: subunit.visits || unit.visits,
    notes,
    isdonotcall: subunit.isdonotcall || unit.isdonotcall,
    calledon: subunit.iscalledon || unit.iscalledon,
    language: subunit.language || unit.language,
    householder_contacted_url: householderContactedRoute.url(null, subunitQueryParam)
  };

  res.render('Territory/UnitOverview', renderVars);

};

/**
 * Householder Contacted
 */
// exports.householderContacted = (req, res) => {
//
//   let territory = res.locals.territory;
//   let requested = res.locals.requested;
//   let unit = requested.unit;
//   let subunit = requested.subunit || {};
//
//   let street = requested.block.street;
//   let hundred = requested.block.hundred;
//
//   let subunitQueryParam = _.isEmpty(subunit) ? null : {'subunit': subunit.name};
//
//   let renderVars = {
//    rajax_add_visit_url: PBURLConstructor.getRoute('add-visit').url(null, subunitQueryParam),
//    rajax_add_householder_url: PBURLConstructor.getRoute('add-householder').url(null, subunitQueryParam),
//    subunit: _.isEmpty(subunit) ? false : true,
//    householders: unit.householders.map(h => _.pick(h, 'name', 'gender')),
//    number: unit.number,
//    unit_overview_url: PBURLConstructor.getRoute('unit-overview').url(),
//    street
//   };
//
//   res.render('Territory/UnitHouseholderContacted', renderVars);
//
// };
