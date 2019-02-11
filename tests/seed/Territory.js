const {ObjectId} = require('mongodb');
const _ = require('lodash');

var territory = {

  valid:  {
    congregation: new ObjectId(),
    fragments: [],
    streets: []
    }

};

var streets = {

  valid: {
    name: 'Oakland',
    odd: [],
    even: [],
    tags: ['low steps']
  },

  invalid: {
    name: '',
    odd: [],
    even: [],
    tags: []
  }

};

var blocks = {

  valid: {
    hundred: 4500,
    units: [],
    worked: []
  },

  sample: [
    {
      hundred: 100,
      units: [],
      worked: []
    },
    {
      hundred: 200,
      units: [],
      worked: []
    },
    {
      hundred: 300,
      units: [],
      worked: []
    },
    {
      hundred: 400,
      units: [],
      worked: []
    },
  ]

};

var units = {

  valid: {
    number: 4502,
    name: null,
    tags: [],
    householders: [],
    visit: [],
    isdonotcall: false,
    language: 'en',
    notes: [],
    iscalledon: false,
    subunits: []
  }

};

var visits = {

  valid: {
    householders_contacted: ['Jason', 'Nathan'],
    contacted_by: 'Julian Hernandez',
    nowcalledon: false,
    details: 'This is a test visit. This is the details field.',
    timestamp: new Date()
  }

};

var householders = {

  valid: {
    name: 'Carson Wentz',
    email: 'eaglesrock@gmail.com',
    phone_number: '2154000468',
    gender: 'male'
  }

};

var notes =  {

  valid: {
    by: 'Julian Hernandez',
    note: 'This is the string that is the body of the note'
  },

};

var fragments = {

  valid: {
    number: 1
  },

  invalid: {

  }

};

// territory.populated = _.extend({}, territory.valid);
// // insert street
// territory.populated.streets.push(streets.valid);
// // insert block
// territory.populated.streets[0].even.push(blocks.valid);
// // insert unit
// territory.populated.streets[0].even[0].push(units.valid);
// // insert visit
// territory.populated.streets[0].even[]
// // insert householder
// territory.populated.streets[0].even[0].push(householders.valid);
// // insert note
// territory.populated.streets[0].even[0].push(notes.valid);

// territory.completed = {
//   congregation: new ObjectId(),
//   fragments: [{
//       number: 1
//     }],
//   streets: [{
//       name: 'Oakland',
//       odd: [],
//       even: [{
//         hundred: 4500,
//         units: [{
//           number: 4502,
//           name: null,
//           tags: [],
//           householders: [{
//             name: 'Carson Wentz',
//             email: 'eaglesrock@gmail.com',
//             phone_number: '2154000468',
//             gender: 'male'
//           }],
//           visit: [],
//           isdonotcall: false,
//           language: 'en',
//           notes: [{
//             by: 'Julian Hernandez',
//             note: 'This is the string that is the body of the note'
//           }],
//           iscalledon: false,
//           subunits: []
//         }],
//         worked: []
//       }],
//       tags: ['low steps']
//     }]
// };

territory.completed = {
  congregation: new ObjectId(),
  fragments: [{
      number: 1
    }],
  streets: [
    {
      name: 'Oakland',
      hundreds: [
        {
          hundred: 4500,
          odd: {},
          even: {
            worked: [new Date()],
            units: [{
              number: 4502,
              tags: ['low steps', 'beware of dog'],
              householders: [{
                name: 'Carson Wentz',
                email: 'eaglesrock@gmail.com',
                phone_number: '2154000468',
                gender: 'male'
              }],
              visit: [],
              isdonotcall: false,
              language: 'en',
              notes: [{
                by: 'Julian Hernandez',
                note: 'This is the string that is the body of the note'
              }],
              iscalledon: false,
              subunits: []
            }]
          }
        }
      ],
      tags: []
    }
  ]
};

module.exports = {
  territory,
  streets,
  blocks,
  units,
  visits,
  householders,
  notes,
  fragments
};
