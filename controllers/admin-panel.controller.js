const _ = require('lodash');
const appRoot = require('app-root-path');

const {PBURLConstructor} = require(`${appRoot}/utils`);
const {territoryServices, congregationServices} = require(`${appRoot}/services`);

exports.land = (req, res) => {

  res.render('AdminPanel/Land', {PBURLConstructor});

};

exports.createTerritory = async (req, res) => {

  let territoryDoc = res.locals.territory;

  // stats for all street in territory
  let streets = [];
  territoryDoc.streets.forEach(street => {

    let stats = territoryServices.streetStats(territoryDoc, street.name);

    let obj = {
      name: street.name,
      stats,
    };

    streets.push(obj);

  });

  // sort streets by name
  streets = _.sortBy(streets, 'name');

  // pass in all available fragment stats
  let fragments = [];
  for (let fragment of territoryDoc.fragments) {
    let stats = await territoryServices.fragmentStats(territoryDoc, fragment.number);
    fragments.push(stats);
  }

  // sort fragments by number
  fragments = _.sortBy(fragments, 'number');

  let renderVars = {
    localize: {
      endpoints: {
        list_streets: PBURLConstructor.getRoute('list-streets').url(),
        list_fragments: PBURLConstructor.getRoute('list-fragments').url(),
        save_territory: PBURLConstructor.getRoute('save-territory').url(),
      },
      streets,
    },
    streets,
    fragments,
    PBURLConstructor,
  };

  res.render('AdminPanel/CreateTerritory', renderVars);

};

exports.createFragment = async (req, res) => {

  let territoryDoc = res.locals.territory;

  // pass in list of users
  let users = await congregationServices.getUsers(req.session.congregation, 'first_name last_name _id');
  // sort users by name
  users = _.sortBy(users, ['first_name', 'last_name']);

  let streets = territoryDoc.streets.map(street => {

    let stats = territoryServices.streetStats(territoryDoc, street.name);

    let obj = {
      name: street.name,
      stats,
    };

    return obj;

  });

  // organize streets by name
  streets = _.sortBy(streets, 'name');

  let renderVars = {
    localize: {
      endpoints: {
        save_fragment: PBURLConstructor.getRoute('save-fragment').url(),
      },
      streets,
    },
    users,
    streets,
  };

  res.render('AdminPanel/CreateFragment', renderVars);

};

exports.managePublishers = (req, res) => {

  res.render('AdminPanel/ManagePublishers');

};
