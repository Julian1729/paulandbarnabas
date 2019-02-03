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

      // it('should save block into fragment', (done) => {
      //
      //   var targetFragmentNumber = seed.territory.completed.fragments[0].number;
      //   var targetBlockId = null;
      //   var testTerritory = Territory(seed.territory.completed);
      //   testTerritory.save()
      //     .then(territory => {
      //       targetBlockId = territory
      //         .findStreet('Oakland')
      //         .findHundred(4500)._id;
      //
      //       expect(targetBlockId).to.exist;
      //       return territory.assignBlockToFragment(targetFragmentNumber, targetBlockId)
      //     })
      //     .then(territory => {
      //       var fragment = territory.findFragment(targetFragmentNumber);
      //       expect(fragment).to.exist;
      //       var findBlock = fragment.blocks.find(id => id === targetBlockId);
      //       expect(findBlock).to.exist;
      //       done();
      //     })
      //     .catch(e => done(e));
      //
      //
      // });

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
              var unitNumbers = [4504, 4506];
              var addedUnits = hundred.addUnits(unitNumbers);
              expect(addedUnits).to.equal(2);
              expect(hundred.unitExists(4504)).to.be.true;
              expect(hundred.unitExists(4506)).to.be.true;
              done();
            })
            .catch(e => done(e));

        });

        it('should not add 2 units to 4500 Oakland but throw UnitsAlreadyExist error with 2 other units', (done) => {

          var unitNumbers = [4504, 4506];
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var addedUnits = hundred.addUnits(unitNumbers);
              expect(addedUnits).to.equal(2);
              return territory.save();
            })
            .then(territory => {
              var hundred = territory.findStreet('Oakland').findHundred(4500);
              try{
                hundred.addUnits(unitNumbers.concat([4508, 4510]));
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

          var unitNumbers = [4504, 4506];
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var addedUnits = hundred.addUnits(unitNumbers);
              expect(addedUnits).to.equal(2);
              return territory.save();
            })
            .then(territory => {
              var hundred = territory.findStreet('Oakland').findHundred(4500);
              var addedUnits = hundred.addUnits(unitNumbers.concat([4508, 4510]), {overwriteDuplicates: true});
              expect(addedUnits).to.equal(4);
              return done();
            })
            .catch(e => done(e));

        });

        it('should add 2 and then skip 2 units in 4500 Oakland', (done) => {

          var unitNumbers = [4504, 4506];
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var addedUnits = hundred.addUnits(unitNumbers);
              expect(addedUnits).to.equal(2);
              return territory.save();
            })
            .then(territory => {
              var hundred = territory.findStreet('Oakland').findHundred(4500);
              var addedUnits = hundred.addUnits(unitNumbers, {skipDuplicates: true});
              // all units should exist and no units should be entered here
              expect( addedUnits ).to.equal(0);
              return done();
            })
            .catch(e => done(e));

        });

        it('should remove more than one unit from 4500 Oakland', (done) => {

          var unitNumbers = [4504, 4506];
          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var addedUnits = hundred.addUnits(unitNumbers);
              expect(addedUnits).to.equal(2);
              return territory.save();
            })
            .then(territory => {
              var street = territory.findStreet('Oakland');
              var hundred = street.findHundred(4500);
              var removed = hundred.removeUnits(unitNumbers);
              expect(removed.length).to.equal(2);
              expect(hundred.unitExists(4504)).to.be.false;
              expect(hundred.unitExists(4506)).to.be.false;
              done();
            })
            .catch(e => done(e));

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

      it('should remove fragment', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {

            var ogFragment = territory.findFragment(seed.territory.completed.fragments[0].number);
            expect(ogFragment).to.exist;
            //territory.saveFragment(seed.fragments.valid, {overwriteFragment: true});
            var remove = territory.removeFragment(seed.territory.completed.fragments[0].number);
            expect(remove).to.be.true;
            expect(territory.fragments).to.have.lengthOf(0);
            done();

          })
          .catch(e => done(e));

      });

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
              blocks: [territory.findStreet('Oakland').findHundred(4500)]
            })
            return territory.save();
          })
          .then(territory => {

            expect(territory.findFragment(2)).to.exist;
            var map = territory.blockMap();
            expect(map).to.exist;
            // look fro this block
            expect(map).to.have.property(territory.findFragment(2).blocks[0]._id.toString());
            done();

          })
          .catch(e => done(e));

      });

      it('should return aray with 1 block that is assigned', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {
            territory.fragments.push({
              number: 2,
              blocks: [territory.findStreet('Oakland').findHundred(4500)]
            })
            return territory.save();
          })
          // assure that we can verify block has been assigned
          .then(territory => {
            var testBlock = territory.findStreet('Oakland').findHundred(4500);
            var result = territory.areBlocksAssigned([testBlock]);
            expect(result).to.have.lengthOf(1);
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

      // write this test
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

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {

            var blockToAdd = territory.findStreet('Oakland').findHundred(4500);
            var fragment = territory.findFragment(1);
            expect(fragment.blocks.length).to.equal(0);
            fragment.assignBlocks([blockToAdd], territory);
            return territory.save();

          })
          // assure that we can verify block has been assigned
          .then(territory => {

            var testBlock = territory.findStreet('Oakland').findHundred(4500);
            var result = territory.areBlocksAssigned([testBlock]);
            expect(result).to.have.lengthOf(1);

            // remove all assigned blocks
            var removedCount = territory.removeBlocksFromFragments(result);
            expect(removedCount).to.equal(1);
            expect(territory.findFragment(1).blocks.length).to.equal(0);
            done();

          })
          .catch(e => done(e));

      });

    });

});
