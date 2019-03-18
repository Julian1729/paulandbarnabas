const {expect} = require('chai');
const _ = require('lodash');
const {ObjectId} = require('mongodb');
const mongoose = require('mongoose');

const Territory = require('../models/Territory');
const User = require('../models/User');
const seed = require('./seed/Territory');
const seedUsers = require('./seed/User');
const Utils = require('../utils/utils');
const errors = require('../errors');


describe('Territory Model', () => {

  /**
   * Clear Territory collection before every test
   */
  beforeEach((done) => {
    // remove all users from db before running test
    Utils.clearCollection(Territory).then(() => done()).catch((e) => done(e));
  });


  it('should store a Territory', (done) => {
    var validTerritory = new Territory(seed.territory.valid);
    validTerritory.save().then(doc => {
      Territory.find({}).then(docs => {
        expect(docs).to.have.lengthOf(1);
        done();
      }).catch(e => done(e));
    })
    .catch(e => done(e))
  });

  it('should store a street into territory', (done) => {
    var validTerritory = new Territory(seed.territory.valid);
    validTerritory.save().then(doc => {
      doc.streets.push(seed.streets.valid);
      doc.save().then(doc => {
        expect(doc).to.have.property('streets').with.lengthOf(1);
        done();
      })
      .catch(e => done(e));
    })
    .catch(e => done(e))
  });

  it('should store a street into territory (alt method)', (done) => {
    var validTerritory = new Territory(seed.territory.valid);
    validTerritory.save().then(doc => {
      Territory.findByIdAndUpdate(doc._id, {$set: {streets: seed.streets.valid}}, {new: true}).then(doc => {
        expect(doc).to.have.property('streets').with.lengthOf(1);
        done();
      })
      .catch(e => done(e));
    })
    .catch(e => done(e))
  });

  it('should not store a street into territory', (done) => {
    var validTerritory = new Territory(seed.territory.valid);
    validTerritory.save().then(doc => {
      Territory.findByIdAndUpdate(doc._id, {$set: {streets: seed.streets.invalid}}, {new: true, runValidators: true}).then(doc => {
        expect(doc).to.have.property('streets').with.lengthOf(0);
        done();
      })
      .catch(e => {
        expect(e).to.exist;
        done();
      });
    })
    .catch(e => done(e))
  });

    describe('Territory Methods', () => {

      it('should find Oakland street in territory', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var street = territory.findStreet('Oakland');
            expect(street).to.have.property('name');
            expect(street.name).to.equal('Oakland');
            done();
          })
          .catch(e => done(e));

      });

      it('should find Territory by congregation id', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            Territory.findByCongregation(seed.territory.completed.congregation)
              .then(congregation => {
                expect(congregation).to.exist;
                done();
              })
              .catch(e => done(e));
          })
          .catch(e => done(e));

      });

    it('should not find congregation by id and return error', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            Territory.findByCongregation(new ObjectId())
              .then(congregation => {
                done( new Error('this should not have passed'));
              })
              .catch(e => {
                expect(e instanceof errors.TerritoryNotFound).to.be.true;
                done();
              });
          })
          .catch(e => done(e));

      });

      it('should find Oakland street', (done) => {
        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var street = territory.findStreet('Oakland');
            expect(street).to.exist;
            expect(street).to.have.property('_id');
            done();
          })
          .catch(e => done(e));
      });

      it('should not find Okland street and return StreetNotFound error', (done) => {
        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            try {
              var street = territory.findStreet('Wakeling');
              throw new errors.TestFailed(`this street should not have been found \n${street}`);
            } catch (e) {
              expect(e).to.exist;
              expect(e instanceof errors.StreetNotFound).to.be.true;
              done();
            }
          })
          .catch(e => done(e));
      });

      it('should add a street into territory', (done) => {

        var newStreet = null;

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            newStreet = territory.addStreet('Wakeling');
            expect(newStreet).to.exist;
            expect(newStreet).to.have.property('_id');
            return territory.save();
          })
          // assure new street saved
          .then(territory => {
            expect(territory.streets.id(newStreet._id)).to.exist;
            done();
          })
          .catch(e => done(e));

      });

      it('should not add duplicate street into territory and throw error', (done) => {

        var existingStreetName = null;

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            try{
              // get existing street name
              existingStreetName = territory.streets[0].name;
              expect(existingStreetName).to.equal('Oakland');
              newStreet = territory.addStreet(existingStreetName);
              throw new Error('Oakland street should not have been added');
            }catch(e){
              expect(e).to.exist;
              expect(e instanceof errors.StreetAlreadyExists).to.be.true;
            }
            return territory.save();
          })
          // assure new street not saved
          .then(territory => {
            var oaklandStreets = _.filter(territory.streets, ['name', existingStreetName]);
            expect(oaklandStreets).to.have.lengthOf(1);
            done();
          })
          .catch(e => done(e));

      });

      it('should return true that Oakland Street exists', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var result = territory.streetExists('Oakland');
            expect(result).to.be.true;
            done();
          })
          .catch(e => done(e));

      });

      it('should return false that Wakeling street exists', (done) => {

      var testTerritory = Territory(seed.territory.completed);
      testTerritory.save()
        .then(territory => {
          var result = territory.streetExists('Wakeling');
          expect(result).to.be.false;
          done();
        })
        .catch(e => done(e));

      });

      it('should find and return Oakland street', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var oakland = territory.findStreet('Oakland');
            expect(oakland).to.exist;
            done();
          })
          .catch(e => done(e));

      });

      it('should not find Wakeling street and throw error', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var nonExistentStreet = territory.findStreet('Wakeling');
            throw new errors.TestFailed('This error should not have been thrown');
            done();
          })
          .catch(e => {
            if(e instanceof errors.StreetNotFound){
              return done();
            }
            return done(e);
          });

      });

      it('should remove Oakland street', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var remove = territory.removeStreet('Oakland');
            expect(remove).to.be.true;
            // check if exists
            expect(territory.streetExists('Oakland')).to.be.false;
            done();
          })
          .catch(e => done(e));

      });

    });

    it('should return the correct block subdocuments', (done) => {

      var addedBlockIds = [];
      var testTerritory = Territory(seed.territory.completed);
      testTerritory.save()
        // add blocks to streets
        .then(territory => {
          var oakland = territory.findStreet('Oakland')
          var oakland4800 = oakland.addHundred(4800)
          oakland4800.addUnits([{number: 4801}, {number: 4803, subunits: ['Apt 1', 'Apt 2']}, {number: 4802}]);
          addedBlockIds.push(oakland4800.odd._id);
          addedBlockIds.push(oakland4800.even._id);
          var knorr = territory.addStreet('Knorr');
          var knorr2800 = knorr.addHundred(2800);
          knorr2800.addUnits([{number: 2801}, {number: 2802}]);
          addedBlockIds.push(knorr2800.odd._id);
          addedBlockIds.push(knorr2800.even._id);
          return territory.save();
        })
        // find blocks
        .then(territory => {
          var blocks = territory.findBlocksById(addedBlockIds);
          //console.log(JSON.stringify(blocks, null, 2));
          expect(blocks).to.have.lengthOf(4);
          // expect(blocks[0]).to.deep.include({street: 'Oakland'});
          // expect(blocks[1]).to.deep.include({street: 'Knorr'});
          done();
        })
        .catch(e => done(e));

    });

    describe('Street methods', () => {

      it('should return true that 4500 Oakland exists', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var oakland = territory.findStreet('Oakland');
            expect(oakland.hundredExists(4500)).to.be.true;
            done();
          })
          .catch(e => done(e));

      });

      it('should return false that 4600 Oakland exists', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var oakland = territory.findStreet('Oakland');
            expect(oakland.hundredExists(4600)).to.be.false;
            done();
          })
          .catch(e => done(e));

      });

      it('should find 4500 hundred of Oakland', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var oakland = territory.findStreet('Oakland');
            oakland.findHundred(4500);
            done();
          })
          .catch(e => done(e));

      });

      it('should find 4500 hundred of Oakland when hundred passed as string', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var oakland = territory.findStreet('Oakland');
            oakland.findHundred('4500');
            done();
          })
          .catch(e => done(e));

      });

      it('should not find 4600 of Oakland and throw error', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var oakland = territory.findStreet('Oakland');
            oakland.findHundred(4600);
            done();
          })
          .catch(e => {
            expect(e instanceof errors.HundredNotFound).to.be.true;
            expect(e.hundred).to.equal(4600);
            done();
          });

      });

      it('should add 4600 hundred of Oakland', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var oakland = territory.findStreet('Oakland');
            expect(oakland).to.exist;
            var newHundred = oakland.addHundred(4600);
            expect(newHundred).to.have.property('_id');
            done();
          })
          .catch(e => done(e));

      });

      it('should not add 4500 hundred of Oakland', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var oakland = territory.findStreet('Oakland');
            expect(oakland).to.exist;
            try {
              expect( oakland.addHundred(4500) ).to.throw( errors.HundredAlreadyExists );
              throw new errors.TestFailed('4600 block of Oakland should not have been added');
            } catch (e) {
              expect(e instanceof errors.HundredAlreadyExists);
              done();
            }
          })
          .catch(e => done(e));

      });

      it('should remove 4500 Oakland', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var oakland = territory.findStreet('Oakland');
            expect(oakland).to.exist;
            var removed = oakland.removeHundred(4500);
            expect( removed ).to.be.true;
            var exists = oakland.hundredExists(4500);
            expect(exists).to.be.false;
            done();
          })
          .catch(e => done(e));

      });

      // it('should return all hundreds', (done) => {
      //
      //   var testTerritory = Territory(seed.territory.completed);
      //   testTerritory.save()
      //     .then(territory => {
      //       var hundreds = territory
      //         .findStreet('Oakland')
      //         .getHundreds();
      //       expect(hundreds).to.be.an('array').but.have.lengthOf(1);
      //       done();
      //     })
      //     .catch(e => done(e));
      //
      // });

      describe('Hundred Methods', () => {

        it('should return true that 4502 Oakland exist', (done) => {

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              expect( hundred.unitExists(4502) ).to.equal(true);
              done();
            })
            .catch(e => done(e));

        });

        it('should return false that 4504 exists', (done) => {
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              expect( hundred.unitExists(4504) ).to.equal(false);
              done();
            })
            .catch(e => done(e));
        });

        describe('Block Methods', () => {

          it('should find 4502 oakland', (done) => {

            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                var street = territory.findStreet('Oakland');
                var hundred = street.findHundred(4500)
                var evenBlock = hundred.even;
                var unit = evenBlock.unit(4502);
                expect(unit).to.exist;
                expect(unit).to.have.property('_id');
                done();
              })
              .catch(e => done(e));

          });

          it('should add tag to 4500 oakland', (done) => {

            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let odd = hundred.odd;
                odd.addTag('Low steps');
                expect(odd.tags).to.include('low steps');
                return done();
              })
              .catch(e => done(e));

          });

          it('should add a worked record to block with current timestamp', (done) => {

            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let odd = hundred.odd;
                expect(odd.worked).to.have.lengthOf(0);
                odd.work();
                expect(odd.worked).to.have.lengthOf(1);
                return done();
              })
              .catch(e => done(e));

          });

          // this doesn't test that it actaully enters the date specified
          // #justoolazy
          it('should add a worked record with passed in timestamp', (done) => {
            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let odd = hundred.odd;
                expect(odd.worked).to.have.lengthOf(0);
                let time = new Date('05-07-1998').getTime();
                odd.work(time);
                expect(odd.worked).to.have.lengthOf(1);
                // test that the date equals the date above
                return done();
              })
              .catch(e => done(e));
          });

        });

        it('should find unit 4502', (done) => {
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var unit = hundred.findUnit(4502)
              expect(unit).to.exist;
              expect(unit).to.have.property('_id');
              done();
            })
            .catch(e => done(e));
        });

        it('should not find unit 4504 and throw UnitNotFound error', (done) => {
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              try {
                hundred.findUnit(4504)
                throw new errors.TestFailed('unit 4504 should not have been found');
              } catch (e) {
                expect(e instanceof errors.UnitNotFound).to.be.true;
                expect(e).to.have.property('number');
                expect(e.number).to.equal(4504);
              } finally {
                done();
              }
            })
            .catch(e => done(e));
        });

        it('should remove 4502 from Oakland', (done) => {

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              hundred.removeUnits([4502]);
              expect(hundred.unitExists(4502)).to.be.false;
              done();
            })
            .catch(e => done(e));

        });

        it('should add 2 units to 4500 Oakland', (done) => {

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var units = [
                {
                  number: 4504
                },
                {
                  number: 4506
                }
              ];
              var addedUnits = hundred.addUnits(units);
              expect(addedUnits).to.equal(2);
              expect(hundred.unitExists(4504)).to.be.true;
              expect(hundred.unitExists(4506)).to.be.true;
              done();
            })
            .catch(e => done(e));

        });

        it('should add 2 units with subunits to 4500 Oakland', (done) => {

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var units = [
                {
                  number: 4504,
                  subunits: ['Floor 1', 'Floor 2']
                },
                {
                  number: 4506
                }
              ];
              var addedUnits = hundred.addUnits(units);
              expect(addedUnits).to.equal(2);
              expect(hundred.unitExists(4504)).to.be.true;
              expect(hundred.unitExists(4506)).to.be.true;
              expect(hundred.findUnit(4504).subunits).to.have.lengthOf(2);
              done();
            })
            .catch(e => done(e));

        });

        it('should not add 2 units to 4500 Oakland but throw UnitsAlreadyExist error with 2 other units', (done) => {

          var units = [
            {
              number: 4504
            },
            {
              number: 4506
            }
          ];
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var addedUnits = hundred.addUnits(units);
              expect(addedUnits).to.equal(2);
              return territory.save();
            })
            .then(territory => {
              var hundred = territory.findStreet('Oakland').findHundred(4500);
              try{
                hundred.addUnits(units.concat([{number: 4508}, {number: 4510}]));
                throw new errors.TestFailed('the above function should have thrown UnitsAlreadyExist');
              }catch(e){
                expect(e instanceof errors.UnitsAlreadyExist).to.be.true;
                expect(e).to.have.property('addedCount');
                expect(e.duplicateNumbers).to.have.lengthOf(2);
                expect(hundred.units).to.have.lengthOf(2);
              } finally {
                return done();
              }
            })
            .catch(e => done(e));

        });

        it('should add 2 and then overwrite 2 units in 4500 Oakland', (done) => {

          var units = [
            {
              number: 4504
            },
            {
              number: 4506
            }
          ];
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var addedUnits = hundred.addUnits(units);
              expect(addedUnits).to.equal(2);
              return territory.save();
            })
            .then(territory => {
              var hundred = territory.findStreet('Oakland').findHundred(4500);
              var addedUnits = hundred.addUnits(units.concat([{number: 4508}, {number: 4510}]), {overwriteDuplicates: true});
              expect(addedUnits).to.equal(4);
              return done();
            })
            .catch(e => done(e));

        });

        it('should skip 2 units in 4500 Oakland', (done) => {

          var units = [
            {
              number: 4504
            },
            {
              number: 4506
            }
          ];
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var addedUnits = hundred.addUnits(units);
              expect(addedUnits).to.equal(2);
              return territory.save();
            })
            .then(territory => {
              var hundred = territory.findStreet('Oakland').findHundred(4500);
              var addedUnits = hundred.addUnits(units, {skipDuplicates: true});
              // all units should exist and no units should be entered here
              expect( addedUnits ).to.equal(0);
              return done();
            })
            .catch(e => done(e));

        });

        it('should remove more than one unit from 4500 Oakland', (done) => {

          var units = [
            {
              number: 4504
            },
            {
              number: 4506
            }
          ];
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var addedUnits = hundred.addUnits(units);
              expect(addedUnits).to.equal(2);
              return territory.save();
            })
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var removed = hundred.removeUnits([4504, 4506]);
              expect(removed.length).to.equal(2);
              expect(hundred.unitExists(4504)).to.be.false;
              expect(hundred.unitExists(4506)).to.be.false;
              done();
            })
            .catch(e => done(e));

        });

      });

      describe('Unit Methods', () => {

        it('should find subunit by subunit name', (done) => {

          var testUnit =
            {
              number: 4504,
              subunits: ["Apt 1", "Apt 2"]
            };
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var addedUnits = hundred.addUnits([testUnit]);
              expect(addedUnits).to.equal(1);
              return territory.save();
            })
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var unit = hundred.findUnit(testUnit.number);
              var subunit = unit.findSubunit('Apt 1');
              expect(subunit).to.exist;
              expect(subunit).to.have.include({name: 'Apt 1'});
              done();
            })
            .catch(e => done(e));

        });

        it('should not find subunit and throw SubunitNotFound', (done) => {

          var testUnit =
            {
              number: 4504,
              subunits: ["Apt 1", "Apt 2"]
            };
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var addedUnits = hundred.addUnits([testUnit]);
              expect(addedUnits).to.equal(1);
              return territory.save();
            })
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var unit = hundred.findUnit(testUnit.number);
              try {
                var subunit = unit.findSubunit('Apt 8');
              } catch (e) {
                expect(e instanceof errors.SubunitNotFound).to.be.true;
              }
              done();
            })
            .catch(e => done(e));

        });

        it('should add householder to unit', (done) => {

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              let householder = unit.addHouseholder('Johnathan Doe', 'male', 'john@doe.com', '2154000468');
              expect(householder).to.exist;
              expect(householder).to.have.property('_id');
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              expect(_.last(unit.householders)).to.include({name: 'Johnathan Doe', gender: 'male', email: 'john@doe.com', phone_number: '2154000468'});
              return done();
            })
            .catch(e => done(e));

        });

        it('should remove householder from unit', (done) => {

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              unit.addHouseholder('Johnathan Doe', 'male', 'john@doe.com', '2154000468');
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              let latestHouseholder = _.last(unit.householders);
              expect(latestHouseholder).to.include({name: 'Johnathan Doe', gender: 'male', email: 'john@doe.com', phone_number: '2154000468'});
              unit.removeHouseholder(latestHouseholder._id);
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              let latestHouseholder = _.last(unit.householders);
              expect(latestHouseholder).to.not.include({name: 'Johnathan Doe', gender: 'male', email: 'john@doe.com', phone_number: '2154000468'});
              return done();
            })
            .catch(e => done(e));

        });

        it('should add a visit to unit', (done) => {

          let visitObj = {
            householders_contacted: ['John', 'Whitney'],
            contacted_by: 'Tracy Scott',
            details: 'Lorem impsum dolor sit amet',
            timestamp: new Date().getTime()
          };

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              unit.addVisit(visitObj);
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              expect(unit.visits).to.have.lengthOf(1);
              return done();
            })
            .catch(e => done(e));

        });

        it('should overwrite (edit) a visit in unit', (done) => {

          let visitObj = {
            householders_contacted: ['John', 'Whitney'],
            contacted_by: 'Tracy Scott',
            details: 'Lorem impsum dolor sit amet',
            timestamp: new Date().getTime()
          };

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              unit.addVisit(visitObj);
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              expect(unit.visits).to.have.lengthOf(1);
              // add existing visit id to object and change householders
              visitObj.id = unit.visits[0]._id.toString();
              visitObj.householders_contacted = ['Jacob'];
              visitObj.contacted_by = 'Leaona Staten';
              unit.addVisit(visitObj);
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              expect(unit.visits).to.have.lengthOf(1);
              expect(unit.visits[0].householders_contacted).to.include('Jacob');
              expect(unit.visits[0].contacted_by).to.include('Leaona Staten');
              return done();
            })
            .catch(e => done(e));

        });

        it('should remove visit by id', (done) => {

          let visitObj = {
            householders_contacted: ['John', 'Whitney'],
            contacted_by: 'Tracy Scott',
            details: 'Lorem impsum dolor sit amet',
            timestamp: new Date().getTime()
          };

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              unit.addVisit(visitObj);
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              expect(unit.visits).to.have.lengthOf(1);
              let latestVisit = _.last(unit.visits);
              unit.removeVisit(latestVisit._id);
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              expect(unit.visits).to.have.lengthOf(0);
              return done();
            })
            .catch(e => done(e));

        });

        it('should add a subunit', (done) => {

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              unit.addSubunit('Floor 8');
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              unit.findSubunit('Floor 8');
              return done();
            })
            .catch(e => done(e));

        });

        it('should remove a subunit by id', (done) => {

          var idToRemove = null;
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              let subunit = unit.addSubunit('Floor 8');
              idToRemove = subunit._id;
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              unit.removeSubunit(idToRemove);
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              expect(unit.subunits).to.not.include('Floor 8');
              return done();
            })
            .catch(e => done(e));

        });

        it('should add tag to unit', (done) => {

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              unit.addTag('Low steps');
              expect(unit.tags).to.include('low steps');
              return done();
            })
            .catch(e => done(e));

        });

        it('should not duplicate tag', (done) => {

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              unit.addTag('low steps');
              expect(unit.tags).to.include('low steps');
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              unit.addTag('low steps');
              expect(unit.tags).to.have.lengthOf(2);
              return done();
            })
            .catch(e => done(e));

        });

        it('should remove tag from unit', (done) => {

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              unit.addTag('low steps');
              expect(unit.tags).to.include('low steps');
              unit.removeTag('low steps');
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              expect(unit.tags).to.not.include('low steps');
              return done();
            })
            .catch(e => done(e));

        });

        it('should add note to unit', (done) => {

          var noteObj = {
            by: 'Brittany Alston',
            note: 'This is a general note'
          };
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              unit.addNote(noteObj);
              let latestNote = _.last(unit.notes)
              expect(latestNote.by).to.equal(noteObj.by);
              return done();
            })
            .catch(e => done(e));

        });

        it('should update note in unit', (done) => {

          var noteObj = {
            by: 'Brittany Alston',
            note: 'This is a general note'
          };
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              unit.addNote(noteObj);
              let latestNote = _.last(unit.notes)
              expect(latestNote.by).to.include(noteObj.by);
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              let latestNote = _.last(unit.notes);
              latestNote.by = 'Chidinma Mapp';
              unit.addNote(latestNote);
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              let latestNote = _.last(unit.notes);
              expect(latestNote.by).to.equal('Chidinma Mapp');
              return done();
            })
            .catch(e => done(e));

        });

        it('should delete note in unit', (done) => {

          var noteObj = {
            by: 'Brittany Alston',
            note: 'This is a general note'
          };
          var idToRemove = null;
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              let newNote = unit.addNote(noteObj);
              idToRemove = newNote._id;
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              expect(unit.notes).to.have.lengthOf(2);
              unit.removeNote(idToRemove);
              return territory.save();
            })
            .then(territory => {
              let street = territory.findStreet('Oakland');
              let hundred = street.findHundred(4500);
              let unit = hundred.findUnit(4502);
              expect(unit.notes).to.have.lengthOf(1);
              return done();
            })
            .catch(e => done(e));

        });

        describe('Subunit Methods', () => {

          it('should add householder to subunit', (done) => {

            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.addSubunit('Apt 1');
                expect(subunit).to.have.property('_id');
                subunit.addHouseholder('Johnathan Doe', 'male', 'john@doe.com', '2154000468');
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                expect(_.last(subunit.householders)).to.include({name: 'Johnathan Doe', gender: 'male', email: 'john@doe.com', phone_number: '2154000468'});
                return done();
              })
              .catch(e => done(e));

          });

          it('should remove householder from subunit', (done) => {

            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.addSubunit('Apt 1');
                subunit.addHouseholder('Johnathan Doe', 'male', 'john@doe.com', '2154000468');
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                let latestHouseholder = _.last(subunit.householders);
                expect(latestHouseholder).to.include({name: 'Johnathan Doe', gender: 'male', email: 'john@doe.com', phone_number: '2154000468'});
                subunit.removeHouseholder(latestHouseholder._id);
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                let latestHouseholder = _.last(subunit.householders);
                expect(latestHouseholder).to.not.exist;
                return done();
              })
              .catch(e => done(e));

          });

          it('should add a visit to subunit', (done) => {

            let visitObj = {
              householders_contacted: ['John', 'Whitney'],
              contacted_by: 'Tracy Scott',
              details: 'Lorem impsum dolor sit amet',
              timestamp: new Date().getTime()
            };

            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.addSubunit('Apt 1');
                subunit.addVisit(visitObj);
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                expect(subunit.visits).to.have.lengthOf(1);
                return done();
              })
              .catch(e => done(e));

          });

          it('should overwrite (edit) a visit in subunit', (done) => {

            let visitObj = {
              householders_contacted: ['John', 'Whitney'],
              contacted_by: 'Tracy Scott',
              details: 'Lorem impsum dolor sit amet',
              timestamp: new Date().getTime()
            };

            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.addSubunit('Apt 1');
                subunit.addVisit(visitObj);
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                expect(subunit.visits).to.have.lengthOf(1);
                // add existing visit id to object and change householders
                visitObj.id = subunit.visits[0]._id.toString();
                visitObj.householders_contacted = ['Jacob'];
                visitObj.contacted_by = 'Leaona Staten';
                subunit.addVisit(visitObj);
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                expect(subunit.visits).to.have.lengthOf(1);
                expect(subunit.visits[0].householders_contacted).to.include('Jacob');
                expect(subunit.visits[0].contacted_by).to.include('Leaona Staten');
                return done();
              })
              .catch(e => done(e));

          });

          it('should remove visit by id', (done) => {

            let visitObj = {
              householders_contacted: ['John', 'Whitney'],
              contacted_by: 'Tracy Scott',
              details: 'Lorem impsum dolor sit amet',
              timestamp: new Date().getTime()
            };

            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.addSubunit('Apt 1');
                subunit.addVisit(visitObj);
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                expect(subunit.visits).to.have.lengthOf(1);
                let latestVisit = _.last(subunit.visits);
                subunit.removeVisit(latestVisit._id);
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                expect(subunit.visits).to.have.lengthOf(0);
                return done();
              })
              .catch(e => done(e));

          });

          it('should add tag to subunit', (done) => {

            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.addSubunit('Apt 1');
                subunit.addTag('Low steps');
                expect(subunit.tags).to.include('low steps');
                return done();
              })
              .catch(e => done(e));

          });

          it('should not duplicate tag', (done) => {

            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.addSubunit('Apt 1');
                subunit.addTag('low steps');
                expect(subunit.tags).to.include('low steps');
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                subunit.addTag('low steps');
                expect(subunit.tags).to.have.lengthOf(1);
                return done();
              })
              .catch(e => done(e));

          });

          it('should remove tag from subunit', (done) => {

            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.addSubunit('Apt 1');
                subunit.addTag('low steps');
                expect(subunit.tags).to.include('low steps');
                subunit.removeTag('low steps');
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                expect(subunit.tags).to.not.include('low steps');
                return done();
              })
              .catch(e => done(e));

          });

          it('should add note to subunit', (done) => {

            var noteObj = {
              by: 'Brittany Alston',
              note: 'This is a general note'
            };
            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.addSubunit('Apt 1');
                subunit.addNote(noteObj);
                let latestNote = _.last(subunit.notes)
                expect(latestNote.by).to.equal(noteObj.by);
                return done();
              })
              .catch(e => done(e));

          });

          it('should update note in subunit', (done) => {

            var noteObj = {
              by: 'Brittany Alston',
              note: 'This is a general note'
            };
            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.addSubunit('Apt 1');
                subunit.addNote(noteObj);
                let latestNote = _.last(subunit.notes)
                expect(latestNote.by).to.include(noteObj.by);
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                let latestNote = _.last(subunit.notes);
                latestNote.by = 'Chidinma Mapp';
                subunit.addNote(latestNote);
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                let latestNote = _.last(subunit.notes);
                expect(latestNote.by).to.equal('Chidinma Mapp');
                return done();
              })
              .catch(e => done(e));

          });

          it('should delete note in subunit', (done) => {

            var noteObj = {
              by: 'Brittany Alston',
              note: 'This is a general note'
            };
            var idToRemove = null;
            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.addSubunit('Apt 1');
                let newNote = subunit.addNote(noteObj);
                idToRemove = newNote._id;
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                subunit.removeNote(idToRemove);
                return territory.save();
              })
              .then(territory => {
                let street = territory.findStreet('Oakland');
                let hundred = street.findHundred(4500);
                let unit = hundred.findUnit(4502);
                let subunit = unit.findSubunit('Apt 1');
                expect(subunit.notes).to.have.lengthOf(0);
                return done();
              })
              .catch(e => done(e));

          });

        });

      });

    });

    describe('Fragment Methods', () => {

      it('should find correct fragment', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var fragment = territory.findFragment(1);
            expect(fragment).to.exist;
            expect(fragment).to.have.property('number');
            done();
          })
          .catch(e => done(e));

      });

      // FIXME: THIS IS BROKEN!
      // it('should remove fragment', (done) => {
      //
      //   var testTerritory = Territory(seed.territory.completed);
      //   testTerritory.save()
      //     .then(territory => {
      //
      //       var ogFragment = territory.findFragment(seed.territory.completed.fragments[0].number);
      //       expect(ogFragment).to.exist;
      //       //territory.saveFragment(seed.fragments.valid, {overwriteFragment: true});
      //       var remove = territory.removeFragment(seed.territory.completed.fragments[0].number);
      //       expect(remove).to.be.true;
      //       expect(territory.fragments).to.have.lengthOf(0);
      //       done();
      //
      //     })
      //     .catch(e => done(e));
      //
      // });

      it('should return true that fragment number 1 exists', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            expect(territory.fragmentNumberExists(1)).to.be.true;
            done();
          })
          .catch(e => done(e));

      });

      it('should return false that fragment number 25 exists', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            expect(territory.fragmentNumberExists(25)).to.be.false;
            done();
          })
          .catch(e => done(e));

      });

      it('should return a block map', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {

            territory.fragments.push({
              number: 2,
              blocks: [territory.findStreet('Oakland').findHundred(4500).odd]
            })
            return territory.save();
          })
          .then(territory => {

            expect(territory.findFragment(2)).to.exist;
            var map = territory.blockMap();
            expect(map).to.exist;
            // look for this block
            expect(map).to.have.property(territory.findFragment(2).blocks[0]._id.toString());
            done();

          })
          .catch(e => done(e));

      });

      it('should return aray with 1 block that is assigned', (done) => {

        var duplicateBlockId = null;
        var singleBlockId = null;
        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {
            duplicateBlockId = territory.findStreet('Oakland').findHundred(4500).odd._id;
            singleBlockId = territory.findStreet('Oakland').findHundred(4500).even._id;
            territory.fragments.push({
              number: 2,
              blocks: [duplicateBlockId]
            });
            return territory.save();
          })
          // assure that we can verify block has been assigned
          .then(territory => {
            var testBlock = territory.findStreet('Oakland').findHundred(4500).odd._id;
            var result = territory.areBlocksAssigned([testBlock, singleBlockId]);
            expect(result).to.have.lengthOf(1);
            done();
          })
          .catch(e => done(e));

      });

      it('should return aray with 0 blocks that are assigned', (done) => {

        var duplicateBlockId = null;
        var singleBlockId = null;
        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {
            duplicateBlockId = territory.findStreet('Oakland').findHundred(4500).odd._id;
            singleBlockId = territory.findStreet('Oakland').findHundred(4500).even._id;
            territory.fragments.push({
              number: 2,
              blocks: [new ObjectId(), new ObjectId()]
            });
            return territory.save();
          })
          // assure that we can verify block has not been assigned
          .then(territory => {
            var testBlock = territory.findStreet('Oakland').findHundred(4500).odd._id;
            var result = territory.areBlocksAssigned([testBlock, singleBlockId]);
            expect(result).to.have.lengthOf(0);
            done();
          })
          .catch(e => done(e));

      });


      it('should add one block to fragment 1', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {
            var blockToAdd = territory.findStreet('Oakland').findHundred(4500).odd._id;
            territory.findFragment(1).assignBlocks([blockToAdd], territory);
            return territory.save();
          })
          // assure that we can verify block has been assigned
          .then(territory => {
            var fragment = territory.findFragment(1);
            expect(fragment.blocks).to.have.lengthOf(1);
            done();

          })
          .catch(e => done(e));

      });

      it('should skip existence check and add one block', (done) => {

        var duplicateBlock = null;
        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {
            duplicateBlock = territory.findStreet('Oakland').findHundred(4500).odd._id;
            territory.findFragment(1).assignBlocks([duplicateBlock], territory);
            return territory.save();
          })
          .then(territory => {
            territory.findFragment(1).assignBlocks([duplicateBlock], null, {skipDuplicatesCheck: true});
            return territory.save();
          })
          // assure that we can verify block has been assigned
          .then(territory => {
            var fragment = territory.findFragment(1);
            expect(fragment.blocks).to.have.lengthOf(2);
            done();

          })
          .catch(e => done(e));

      });


      it('should not add any block to fragment and throw BlocksAlreadyAssignedToFragment error', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {
            var blockToAdd = territory.findStreet('Oakland').findHundred(4500).odd._id;
            territory.findFragment(1).assignBlocks([blockToAdd], territory);
            return territory.save();
          })
          // assure that we can verify block has been assigned
          .then(territory => {
            var fragment = territory.findFragment(1);
            expect(fragment.blocks).to.have.lengthOf(1);
            done();

          })
          .catch(e => done(e));

      });

      it('should return true that fragment one has block', (done) => {

        var blockToFind = null;
        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {
            blockToFind = territory.findStreet('Oakland').findHundred(4500).odd._id;
            territory.findFragment(1).assignBlocks([blockToFind], territory);
            return territory.save();
          })
          // assure that we can verify block has been assigned
          .then(territory => {
            var fragment = territory.findFragment(1);
            expect(fragment.hasBlock(blockToFind)).to.equal(true);
            done();
          })
          .catch(e => done(e));

      });


      it('should remove one block from fragment 1', (done) => {

        var blockToRemove = null;
        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {
            var blockToAdd = territory.findStreet('Oakland').findHundred(4500).even._id;
            territory.findFragment(1).assignBlocks([blockToAdd], territory);
            return territory.save();
          })
          .then(territory => {
            blockToRemove = territory.findStreet('Oakland').findHundred(4500).even._id;
            var removedCount = territory.findFragment(1).removeBlocks([blockToRemove]);
            expect(removedCount).to.equal(1);
            return territory.save();
          })
          .then(territory => {
            var fragment = territory.findFragment(1);
            expect(fragment.hasBlock(blockToRemove)).to.equal(false);
            done();
          })
          .catch(e => done(e));

      });


      it('should remove blocks from corresponding fragments', (done) => {

        var testBlock = null;
        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {
            testBlock = territory.findStreet('Oakland').findHundred(4500).odd._id;
            var fragment = territory.findFragment(1);
            expect(fragment.blocks.length).to.equal(0);
            fragment.assignBlocks([testBlock], territory);
            expect(fragment.blocks.length).to.equal(1);
            return territory.save();

          })
          // assure that we can verify block has been assigned
          .then(territory => {
            var result = territory.areBlocksAssigned([testBlock]);
            console.log('res', JSON.stringify(result, null, 2));
            expect(result).to.have.lengthOf(1);
            // remove all assigned blocks
            var removedCount = territory.removeBlocksFromFragments(result);
            //expect(removedCount).to.equal(1);
            return territory.save();
          })
          .then(territory => {
            expect(territory.findFragment(1).blocks.length).to.equal(0);
            done();
          })
          .catch(e => done(e));

      });

      it('should assign fragment to user', (done) => {

        var theUser = null;

        Utils.clearCollection(User)
          .then(() => {

            // enter user into db
            return new User(seedUsers.validUser).save();

          })
          .then(user => {
            theUser = user;
            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              // assign block to fragment
              .then(territory => {

                var blockToAdd = territory.findStreet('Oakland').findHundred(4500).odd._id;
                var fragment = territory.findFragment(1);
                fragment.assignHolder(theUser._id);
                return territory.save();
              })
              // assure that we can verify block has been assigned
              .then(territory => {
                var fragment = territory.findFragment(1);
                expect(_.last(fragment.assignment_history).to).to.equal(theUser._id);
                done();
              })
              .catch(e => done(e));

          })
          .catch(e => done(e));

      });


      it('should return current fragment holder id', (done) => {

        var theUser = null;

        Utils.clearCollection(User)
          .then(() => {
            // enter user into db
            return new User(seedUsers.validUser).save();
          })
          .then(user => {
            theUser = user;
            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              // assign block to fragment
              .then(territory => {
                var blockToAdd = territory.findStreet('Oakland').findHundred(4500).odd._id;
                var fragment = territory.findFragment(1)
                fragment.assignHolder(theUser._id);
                return territory.save();
              })
              // assure that we can verify block has been assigned
              .then(territory => {
                var fragment = territory.findFragment(1);
                expect(fragment.holder().toString()).to.equal(theUser._id.toString());
                done();
              })
              .catch(e => done(e));
          })
          .catch(e => done(e));

      });

      it('should unassign fragment by adding empty assignment', (done) => {

        var userId = new ObjectId().toString();
        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {
            var blockToAdd = territory.findStreet('Oakland').findHundred(4500).odd._id;
            var fragment = territory.findFragment(1);
            fragment.assignHolder(userId);
            return territory.save();
          })
          // assure that we can verify block has been assigned
          .then(territory => {
            var fragment = territory.findFragment(1);
            expect(fragment.holder()).to.equal(userId);
            fragment.unassignHolder();
            expect(fragment.holder()).to.equal(null);
            done();
          })
          .catch(e => done(e));

      });


      it('should normalize tags when saved', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var block = territory.findStreet('Oakland').findHundred(4500).even;
            block.tags.push('The  tag ');
            return territory.save();
          })
          .then(territory => {
            var block = territory.findStreet('Oakland').findHundred(4500).even;
            console.log(JSON.stringify(block.tags, null, 2));
            expect(block.tags).to.include('the tag');
            done();
          })
          .catch(e => done(e));

      });

      it('should find 1 fragment that belong to user', (done) => {

        var theUser = null;

        Utils.clearCollection(User)
          .then(() => {

            // enter user into db
            return new User(seedUsers.validUser).save();

          })
          .then(user => {
            theUser = user;
            var testTerritory = Territory(seed.territory.completed);
            testTerritory.save()
              // assign block to fragment
              .then(territory => {

                var blockToAdd = territory.findStreet('Oakland').findHundred(4500).odd._id;
                var fragment = territory.findFragment(1);
                fragment.assignHolder(theUser._id);
                return territory.save();
              })
              // assure that we can verify block has been assigned
              .then(territory => {
                var fragments = territory.findUserFragments(theUser.id);
                expect(fragments).to.have.lengthOf(1);
                expect(fragments[0]).to.have.property('blocks');
                done();
              })
              .catch(e => done(e));

          })
          .catch(e => done(e));

      });

      // it('should return populated and referenced fragment blocks', (done) => {
      //
      //     var blocksToAdd = [];
      //     var testTerritory = Territory(seed.territory.completed);
      //     testTerritory.save()
      //       .then(territory => {
      //         var street = territory.findStreet('Oakland');
      //         var oakland4500 = street.findHundred(4500);
      //         hundred.addUnits([{number: 4504},{number: 4506},{number: 4503}];
      //         blocksToAdd.push(oakland4500.odd._id);
      //         blocksToAdd.push(oakland4500.even._id);
      //         // add to fragment
      //
      //         done();
      //       })
      //       .catch(e => done(e));
      //
      // });

    });

});
