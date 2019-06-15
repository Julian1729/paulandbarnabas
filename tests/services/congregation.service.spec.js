const {expect} = require('chai');
const {ObjectId} = require('mongodb');
const appRoot = require('app-root-path');

const {helpers} = require(`${appRoot}/utils`);
const congregationSeed = require(`${appRoot}/tests/seed/congregation.seed`);
const {congregationServices} = require(`${appRoot}/services`);
const {CongregationModel, UserModel} = require(`${appRoot}/models`);

describe('Congregation Services', () => {

  let congregation = null;

  before( async () => {
    // clear congreation collection
    await helpers.clearCollection(CongregationModel);
    // insert seed congregation
    congregation = await new CongregationModel(congregationSeed.validCongregation).save();
    // clear user collection
    await helpers.clearCollection(UserModel);
    // insert 4 users, attach 3 to congregation
    await UserModel.create([
      {
        first_name: 'Julian',
        last_name: 'Hernandez',
        email: 'hernandez.julian17@gmail.com',
        phone_number: '(215)400-0468',
        title: 'Ministerial Servant',
        password: 'newpasssword',
        congregation: congregation._id
      },
      {
        first_name: 'Betzaida',
        last_name: 'Hernandez',
        email: '1969b7@gmail.com',
        phone_number: '(215)629-6210',
        title: 'Regular Pioneer',
        password: 'passwordhere',
        congregation: congregation._id
      },
      {
        first_name: 'Julio',
        last_name: 'Hernandez',
        email: 'hernandez.julio212@gmail.com',
        phone_number: '(215)629-6208',
        title: 'Elder',
        password: 'juliopassword',
        congregation: congregation._id
      },
      {
        first_name: 'Michael',
        last_name: 'Scott',
        email: 'littlekidlover@gmail.com',
        phone_number: '(215)555-5555',
        title: 'Publisher',
        password: 'passwordduh',
        congregation: new ObjectId()
      },
    ])
  });

  describe('getUsers', () => {

    it('should get all users attached to congregation', async () => {

      let users = await congregationServices.getUsers(congregation._id);
      expect(users).to.have.lengthOf(3);
      expect(users[0]).to.have.property('_id');

    });

    it('should get specified fields of users attached to congregation', async () => {

      let users = await congregationServices.getUsers(congregation._id, 'first_name last_name');
      expect(users[0]).to.have.property('first_name').but.not.have.property('phone_number');
      expect(users).to.have.lengthOf(3);

    });

  });

});
