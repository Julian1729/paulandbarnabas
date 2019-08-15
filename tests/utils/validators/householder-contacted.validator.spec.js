const {expect} = require('chai');
const appRoot = require('app-root-path');

const {householderContactedValidator} = require(`${appRoot}/utils/validators`);

describe('Householder Contacted Validation', () => {

  it('should pass validation', () => {

    let validationErrors = householderContactedValidator({
        householders_contacted: ['Julian', 'Michael'],
        publisher: 'Julian',
        details: 'Talked to Julian and Michael about trinity',
        date: 'August 21st, 2019',
        time: '8:30 AM',
    });

    expect(validationErrors).to.be.undefined;

  });

  it('should not pass validation with 0 contacted householders', () => {

    let validationErrors = householderContactedValidator({
        householders_contacted: [],
        publisher: 'Julian',
        details: 'Talked to Julian and Michael about trinity',
        date: 'August 21st, 2019',
        time: '8:30 AM',
    });

    expect(validationErrors).to.not.be.undefined;
    expect(Object.keys(validationErrors)).to.have.lengthOf(1);
    expect(validationErrors).to.have.property('householders_contacted');

  });

});
