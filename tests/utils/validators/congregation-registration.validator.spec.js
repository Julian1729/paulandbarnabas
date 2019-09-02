const {expect} = require('chai');
const appRoot = require('app-root-path');

const {helpers} = require(`${appRoot}/utils`);
const {UserModel} = require(`${appRoot}/models`);
const {congregationRegistrationValidator} = require(`${appRoot}/utils/validators`);

describe('Congregation Registration Validator', () => {

  it('should pass validation', () => {

    let result = congregationRegistrationValidator({
      congregation: {
        name: 'Roosevelt',
        circuit: 'PA-16',
        city: 'Philadelphia',
        country: 'USA',
        number: 99499,
        language: 'English',
        referall: 'Another congregation',
      },
      user: {
        first_name: 'Julian',
        last_name: 'Hernandez',
        email: 'hernandez.julian17@gmail.com',
        email_confirm: 'hernandez.julian17@gmail.com',
        phone_number: '2154000468',
        password: 'julianspassword',
        password_confirm: 'julianspassword',
        position: 'I am the service overseer',
      },
      territory: {
        description: 'rural, big city',
      },
    });

    expect(result).to.be.undefined;

  });

  it('should not pass validation with invalid language and user position', () => {

    let result = congregationRegistrationValidator({
      congregation: {
        name: 'Roosevelt',
        circuit: 'PA-16',
        city: 'Philadelphia',
        country: 'USA',
        number: 99499,
        language: 'doodlebob',
        referall: 'Another congregation',
      },
      user: {
        first_name: 'Julian',
        last_name: 'Hernandez',
        email: 'hernandez.julian17@gmail.com',
        email_confirm: 'hernandez.julian17@gmail.com',
        phone_number: '2154000468',
        password: 'julianspassword',
        password_confirm: 'julianspassword',
        position: '',
      },
      territory: {
        description: 'rural, big city',
      },
    });

    expect(result).to.have.property('congregation.language');
    expect(result).to.have.property('user.position');

  });

});
