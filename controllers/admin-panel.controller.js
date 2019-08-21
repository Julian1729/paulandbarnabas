const appRoot = require('app-root-path');

const {PBURLConstructor} = require(`${appRoot}/utils`);
const {territoryServices} = require(`${appRoot}/services`);

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

  // pass in all available fragment stats
  let fragments = [];
  for (let fragment of territoryDoc.fragments) {
    let stats = await territoryServices.fragmentStats(territoryDoc, fragment.number);
    fragments.push(stats);
  }

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

exports.createFragment = (req, res) => {

  res.render('AdminPanel/CreateFragment');

};

exports.managePublishers = (req, res) => {

  res.render('AdminPanel/ManagePublishers');

};
