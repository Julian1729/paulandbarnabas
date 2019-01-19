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


  it('should store 2 even blocks into street', (done) => {
    var buildTerritory = _.extend({}, seed.territory.valid);
    buildTerritory.streets.push(seed.streets.valid);
    var validTerritory = new Territory(buildTerritory);
    validTerritory.save().then(doc => {
      expect(doc).to.have.property('streets').with.lengthOf(1);

      Territory.findByIdAndUpdate(doc._id, {
        $push: {
          "streets.0.even": seed.blocks.valid
        }
      } ,{new: true, runValidators: true})
        .then(doc => {
          expect(doc.streets[0].even).to.have.lengthOf(1);

          Territory.findByIdAndUpdate(doc._id, {
            $push: {
              "streets.0.even": seed.blocks.valid
            }
          }, {new: true, runValidators: true})
            .then(doc => {
              expect(doc.streets[0].even).to.have.lengthOf(2);
              done();
            })
            .catch(e => done(e));

        })
        .catch(e => done(e));

    })
    .catch(e => done(e));
  });

  it('should store 2 units into one block', (done) => {
    var buildTerritory = _.cloneDeep(seed.territory.valid);
    buildTerritory.streets.push(seed.streets.valid);
    buildTerritory.streets[0].even.push(seed.blocks.valid);
    var validTerritory = new Territory(buildTerritory);
    validTerritory.save()
      .then(territory => {
        expect(territory.streets[0].even).to.have.lengthOf(1);
        territory.streets[0].even[0].units.push(seed.units.valid);
        territory.save()
          .then(terr => {
            expect(terr.streets[0].even[0].units).to.have.lengthOf(1);
            done();
          })
          .catch(e => done(e))
      })
      .catch(e => done(e));
  });

  describe('Units', () => {

    it('should store 1 visit into unit', (done) => {
      var buildTerritory = _.cloneDeep(seed.territory.valid);
      buildTerritory.streets.push(seed.streets.valid);
      buildTerritory.streets[0].even.push(seed.blocks.valid);
      buildTerritory.streets[0].even[0].units.push(seed.units.valid);
      var validTerritory = new Territory(buildTerritory);
      validTerritory.save()
        .then(t => {
          Territory.findByIdAndUpdate(t._id, {
            $push: {
              "streets.0.even.0.units.0.visits": seed.visits.valid
            }
          }, {new: true, runValidators: true})
            .then(t => {
              expect(t.streets[0].even[0].units[0].visits).to.have.lengthOf(1);
              done();
            })
            .catch(e => done(e));
        })
        .catch(e => done(e));
    });

    it('should insert one householder into unit', (done) => {
      var terr = _.cloneDeep(seed.territory.valid);
      terr.streets.push(seed.streets.valid);
      terr.streets[0].even.push(seed.blocks.valid);
      terr.streets[0].even[0].units.push(seed.units.valid);
      var validTerritory = new Territory(terr);
      validTerritory.save()
        .then(t => {
          t.streets[0].even[0].units[0].householders.push(seed.householders.valid);
          t.save()
            .then(t => {
              expect(t.streets[0].even[0].units[0].householders).to.have.lengthOf(1);
              done();
            })
            .catch(e => done(e));
        })
        .catch(e => done(e));
    });

    it('should insert note into visit', (done) => {
      var terr = _.cloneDeep(seed.territory.valid);
      terr.streets.push(seed.streets.valid);
      terr.streets[0].even.push(seed.blocks.valid);
      var validTerritory = new Territory(terr);
      validTerritory.save()
        .then(t => {
          t.streets[0].even[0].units[0].notes.push(seed.notes.valid);
          t.save()
            .then(t => {
              expect(t.streets[0].even[0].units[0].notes).to.have.lengthOf(1);
              done();
            })
            .catch(e => done(e));
        })
        .catch(e => done(e));
    });

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

      it('should save block into fragment', (done) => {

        var targetFragmentNumber = seed.territory.completed.fragments[0].number;
        var targetBlockId = null;
        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            targetBlockId = territory
              .findStreet('Oakland')
              .findBlock(4500)._id;

            expect(targetBlockId).to.exist;
            return territory.assignBlockToFragment(targetFragmentNumber, targetBlockId)
          })
          .then(territory => {
            var fragment = territory.findFragment(targetFragmentNumber);
            expect(fragment).to.exist;
            var findBlock = fragment.blocks.find(id => id === targetBlockId);
            expect(findBlock).to.exist;
            done();
          })
          .catch(e => done(e));


      });

    });

    describe('Street methods', () => {

      it('should return all blocks', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var blocks = territory
              .findStreet('Oakland')
              .getBlocks('even');
            expect(blocks).to.be.an('array').but.have.lengthOf(1);
            done();
          })
          .catch(e => done(e));

      });

      it('should find the 4500 block of Oakland St.', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {
            var block = territory
              .findStreet('Oakland')
              .findBlock(4500);
            expect(block).to.exist;
            done();
          })
          .catch(e => done(e));

      });

        it('should not find the 4600 block of Oakland St.', (done) => {

          var testTerritory = Territory(seed.territory.completed);
          testTerritory.save()
            .then(territory => {
              var block = territory
                .findStreet('Oakland')
                .findBlock(4600);
              expect(block).to.not.exist;
              done();
            })
            .catch(e => done(e));

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

      it('should return a fragment map', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          .then(territory => {

            territory.fragments.push({
              number: 2,
              blocks: [territory.findStreet('Oakland').findBlock(4500)]
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

      // test areBlocksAssigned
      it('should return aray with 1 block that is assigned', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {

            territory.fragments.push({
              number: 2,
              blocks: [territory.findStreet('Oakland').findBlock(4500)]
            })
            return territory.save();
          })
          // assure that we can verify block has been assigned
          .then(territory => {

            var testBlock = territory.findStreet('Oakland').findBlock(4500);
            var result = territory.areBlocksAssigned([testBlock]);
            console.log(result);
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

            var blockToAdd = territory.findStreet('Oakland').findBlock(4500);
            territory.findFragment(1).addBlocks([blockToAdd]);
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

      it('should remove one block from fragment 1', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {
            var blockToAdd = territory.findStreet('Oakland').findBlock(4500);
            territory.findFragment(1).addBlocks([blockToAdd]);
            return territory.save();
          })
          .then(territory => {

            var blockToAdd = territory.findStreet('Oakland').findBlock(4500)._id;
            var removedCount = territory.findFragment(1).removeBlocks([blockToAdd]);
            expect(removedCount).to.equal(1);
            return territory.save();
          })
          .then(territory => {

            var fragment = territory.findFragment(1);
            expect(fragment.blocks).to.have.lengthOf(0);
            done();

          })
          .catch(e => done(e));

      });


      it('should remove blocks from corresponding fragments', (done) => {

        var testTerritory = Territory(seed.territory.completed);
        testTerritory.save()
          // assign block to fragment
          .then(territory => {

            var blockToAdd = territory.findStreet('Oakland').findBlock(4500);
            var fragment = territory.findFragment(1);
            expect(fragment.blocks.length).to.equal(0);
            fragment.addBlocks([blockToAdd]);
            return territory.save();

          })
          // assure that we can verify block has been assigned
          .then(territory => {

            var testBlock = territory.findStreet('Oakland').findBlock(4500);
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

      // it('should save fragment 2', (done) => {
      //
      //   var testTerritory = Territory(seed.territory.completed);
      //   testTerritory.save()
      //     // add some more blocks to Oakland street
      //
      //     // assign block to fragment
      //     .then(territory => {
      //       var blockToAdd = territory.findStreet('Oakland').findBlock(4500);
      //       territory.findFragment(1).addBlocks([blockToAdd]);
      //       return territory.save();
      //     })
      //     // assure that we can verify block has been assigned
      //     .then(territory => {
      //
      //       var fragment = territory.findFragment(1);
      //       expect(fragment.blocks).to.have.lengthOf(1);
      //       done();
      //
      //     })
      //     .catch(e => done(e));
      //
      // });

      // it('should throw error for trying to overwrite fragment one', (done) => {
      //
      // });
      //
      // it('should throw error for trying to use an already assigned block', (done) => {
      //
      // });
      //
      // it('should overwrite fragment 1', (done) => {
      //
      // });
      //
      // it('should overwrite fragment 1s blocks and enter into 2', (done) => {
      //
      // });

    });

});
