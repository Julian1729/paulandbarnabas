const {expect} = require('chai');
const appRoot = require('app-root-path');

const {createTerritoryValidator} = require(`${appRoot}/utils/validators`);

describe('Create Territory Validator', () => {

  it('should pass validation wo/ fragment assignment', () => {

    var validation = createTerritoryValidator({
      block_hundred: '4500',
      odd_even: 'odd',
      units: [{number: '4500', subunit: ['Apt 1']}, {number: '4501'}],
      street: 'Oakland',
      fragment_unassigned: 'on'
    });
    expect(validation).to.be.undefined;

  });

  it('should pass validation w/ fragment assignment', () => {

    var validation = createTerritoryValidator({
      block_hundred: '4500',
      odd_even: 'odd',
      units: [{number: '4500', subunit: ['Apt 1']}, {number: '4501'}],
      street: 'Oakland',
      fragment_unassigned: 'off',
      fragment_assignment: '4',
    });
    expect(validation).to.be.undefined;

  });

  it('should pass validation wo/ fragment unassigned passed in', () => {

    var validation = createTerritoryValidator({
      block_hundred: '4500',
      odd_even: 'odd',
      units: [{number: '4500', subunit: ['Apt 1']}, {number: '4501'}],
      street: 'Oakland',
      fragment_assignment: '4',
    });
    expect(validation).to.be.undefined;

  });

  it('should fail validation wo/ fragment assignment passed in', () => {

    var validation = createTerritoryValidator({
      block_hundred: '4500',
      odd_even: 'odd',
      units: [{number: '4500', subunit: ['Apt 1']}, {number: '4501'}],
      street: 'Oakland',
    });
    expect(validation).to.not.be.undefined;
    expect(validation).to.have.property('fragment_assignment');

  });

  it('should fail validation empty units array', () => {

    var validation = createTerritoryValidator({
      block_hundred: '4500',
      odd_even: 'odd',
      units: [],
      street: 'Oakland',
      fragment_assignment: '4',
    });
    expect(validation).not.to.be.undefined;
    expect(validation).to.have.property('units');

  });

  it('should fail validation wo/ new street name', () => {

    var validation = createTerritoryValidator({
      block_hundred: '4500',
      odd_even: 'odd',
      units: [{number: '4500', subunit: ['Apt 1']}, {number: '4501'}],
      fragment_unassigned: 'off',
      fragment_assignment: '4',
    });
    expect(validation).to.not.be.undefined;
    expect(validation).to.have.property('new_street_name');

  });

  it('should pass validation w/ only new street name', () => {

    var validation = createTerritoryValidator({
      block_hundred: '4500',
      odd_even: 'odd',
      new_street_name: 'Wyoming',
      units: [{number: '4500', subunit: ['Apt 1']}, {number: '4501'}],
      fragment_unassigned: 'off',
      fragment_assignment: '4',
    });
    expect(validation).to.be.undefined;

  });

});
