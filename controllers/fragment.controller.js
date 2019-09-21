/**
 * Fragment Controllers and Middleware;
 */
const _ = require('lodash');
const moment = require('moment');
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
    fragment_number: fragment.number,
    // Oakland: {id: 'asdfasdf', blocks: {hundred: 4700, odd_even: 'even'}}
    streets: {},
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

  // set breadcrumb vars
  renderVars.breadcrumbs = {
    fragment: {
      overview_url: PBURLConstructor.getRoute('fragment-overview').url({fragment_number: fragment.number}),
      number: fragment.number,
    },
  };

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
    localize: {
      endpoints: {
        mark_block_worked: PBURLConstructor.getRoute('mark-block-worked').url({street_name: block.street, hundred: block.hundred, side: block.odd_even}),
        // OPTIMIZE: including 'TAGHERE' and replacing on front end is hacky
        add_tag: PBURLConstructor.getRoute('block:add-tag').url({street_name: block.street, hundred: block.hundred, side: block.odd_even}, {tag: 'TAGHERE'}),
      }
    },
    block: {
      hundred: block.hundred,
      side: block.odd_even,
      street: block.street,
      tags: block.block.tags,
      lastWorked: _.last(block.block.worked),
    },
    units: formattedUnits,
  };

  let fragment = res.locals.collected.fragment;

  // set breadcrumb vars
  renderVars.breadcrumbs = {
    fragment: {
      overview_url: PBURLConstructor.getRoute('fragment-overview').url({fragment_number: fragment.number}),
      number: fragment.number,
    },
    block: {
      overview_url: PBURLConstructor.getRoute('block-overview').url({fragment_number: fragment.number, hundred: block.hundred, street_name: block.street, side: block.odd_even}),
      hundred: block.hundred,
      street: block.street,
      side: block.odd_even,
    },
  };

  return res.render('Territory/BlockOverview', renderVars);

};

/**
 * Unit Overview
 */
exports.unitOverview = (req, res) => {

  let unit = res.locals.collected.unit;
  let subunit = res.locals.collected.subunit;
  let block = res.locals.collected.blockRef;

  let fragmentNumber = res.locals.collected.fragment.number;

  // init an object to be passed into URLConstructor
  // as query param with subunit name
  let subunitQueryParam = _.isEmpty(subunit) ? null : {'subunit' : subunit.name};

  // set globals on PBURLConstructor
  PBURLConstructor.setGlobal('street_name', block.street);
  PBURLConstructor.setGlobal('hundred', block.hundred);
  PBURLConstructor.setGlobal('unit_number', unit.number);

  let unitOptions = {

    tags: {
      add: {
        title: 'add tag',
        endpoint: PBURLConstructor.getRoute('add-tag').url(null, _.extend(_.clone(subunitQueryParam), {tag: 'TAGHERE'})),
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
          by: `${req.session.first_name} ${req.session.last_name}`
        },
        id: 'option-quicknote-ni'
      },

      busy: {
        title: 'busy, call again',
        endpoint: PBURLConstructor.getRoute('add-note').url(null, subunitQueryParam),
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
    localize: {
      endpoints: {
        remove_visit: PBURLConstructor.getRoute('remove-visit').url({visitId: 'IDHERE'}),
        remove_note: PBURLConstructor.getRoute('remove-note').url({noteId: 'IDHERE'}),
        remove_householder: PBURLConstructor.getRoute('remove-householder').url({householderId: 'IDHERE'}),
        edit_note: PBURLConstructor.getRoute('add-note').url(),
      },
      urls: {
        edit_visit: PBURLConstructor.getRoute('unit-add-visit').url(null, {id: 'IDHERE'}),
      }
    },
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

  // set breadcrumb vars
  renderVars.breadcrumbs = {
    fragment: {
      overview_url: PBURLConstructor.getRoute('fragment-overview').url({fragment_number: fragmentNumber}),
      number: fragmentNumber,
    },
    block: {
      overview_url: PBURLConstructor.getRoute('block-overview').url({fragment_number: fragmentNumber, hundred: block.hundred, street_name: block.street, side: block.odd_even}),
      hundred: block.hundred,
      street: block.street,
      side: block.odd_even,
    },
    unit: {
      overview_url: PBURLConstructor.getRoute('unit-overview').url({fragment_number: fragmentNumber, street_name: block.street, unit_number: unit.number}),
      number: unit.number,
    }
  };

  if(!_.isEmpty(subunit)){
    renderVars.breadcrumbs.unit.subunit = {
      overview_url: PBURLConstructor.getRoute('unit-overview').url({fragment_number: fragmentNumber, street_name: block.street, unit_number: unit.number}, {subunit: subunit.name}),
      name: subunit.name,
    };
  }

  res.render('Territory/UnitOverview', renderVars);

};

/**
 * Householder Contacted
 */
exports.householderContacted = (req, res) => {

  let territory = res.locals.territory;
  let unit = res.locals.collected.unit;
  let subunit = res.locals.collected.subunit;

  let block = res.locals.collected.blockRef;
  let fragment = res.locals.collected.fragment;

  let visitId = req.query.id;
  let visit = null;
  if(visitId){
    // discern whether using unit or subunit
    let visitable = _.isEmpty(subunit) ? unit : subunit;
    // find visit
    visit = _.find(visitable.visits, ['id', visitId]);
    if(!visit) return res.status(404).send();
    visit = visit.toObject();

    // split time into date into human readable formats
    visit.date = moment(visit.timestamp).format('MMMM Do, YYYY');
    visit.time = moment(visit.timestamp).format('h:mm A');
  }

  let subunitQueryParam = _.isEmpty(subunit) ? null : {'subunit': subunit.name};

  PBURLConstructor.setGlobal('street_name', block.street);
  PBURLConstructor.setGlobal('hundred', block.hundred);
  PBURLConstructor.setGlobal('unit_number', unit.number);
  PBURLConstructor.setGlobal('fragment_number', fragment.number);

  // params object
  // FIXME: this could be optimized, url was running rendering
  // wrong params dues to require vs import i think
  let urlParams = {
    street_name: block.street,
    hundred: block.number,
    unit_number: unit.number,
    fragment_number: fragment.number,
  };

  let renderVars = {
    localize: {
      visit,
    },
    ajax_add_visit_url: PBURLConstructor.getRoute('add-visit').url(urlParams, subunitQueryParam),
    ajax_add_householder_url: PBURLConstructor.getRoute('add-householder').url(urlParams, subunitQueryParam),
    subunit: _.isEmpty(subunit) ? false : true,
    // only padding in name and gender for householders
    householders: unit.householders.map(h => _.pick(h, 'name', 'gender')),
    number: unit.number,
    unit_overview_url: PBURLConstructor.getRoute('unit-overview').url(urlParams, subunitQueryParam),
    street: block.street,
    visit,
  };

  res.render('Territory/HouseholderContacted', renderVars);

};
