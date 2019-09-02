const _ = require('lodash');
const appRoot = require('app-root-path');
const HttpStatus = require('http-status-codes');

const constants = require('../config/constants');
const {TerritoryModel, CongregationModel} = require(`${appRoot}/models`);
const {territoryServices} = require(`${appRoot}/services`);
const {logger, PBURLConstructor, Session} = require(`${appRoot}/utils`);

exports.land = async (req, res) => {

  let session = new Session(req);
  let territoryDoc = res.locals.territory;
  let user = session.user;

  let renderVars = {
    'dashboard_stats': {
      fragment_count: 0,
      unit_count: 0
    },
    'fragments': [],
    'congregation_name': '',
    admin: {},
  };

  let userFragments = territoryServices.userFragments(territoryDoc, user.user_id);
  let fragmentStats = [];
  for (let fragment of userFragments) {
    let stats = await territoryServices.fragmentStats(territoryDoc, fragment.number);
    fragmentStats.push(stats);
  }
  let fragmentRoute = PBURLConstructor.getRoute('fragment-overview');

  // add overview url for each fragment
  renderVars.fragments = fragmentStats.map(fragment => {

    fragment.overview_url = fragmentRoute.url({fragment_number: fragment.number});
    return fragment;

  });

  renderVars.dashboard_stats.fragment_count = userFragments.length;
  renderVars.dashboard_stats.unit_count = _.sum(fragmentStats.map(f => f.unit_count));

  // get congregation name
  let congregation = await CongregationModel.findById(session.user.congregation, 'name admin').populate('admin');
  renderVars.congregation_name = congregation.name;

  if(!session.user.isAdmin){
    renderVars.admin = congregation.admin;
  }

  res.render('Dashboard', renderVars);

};
