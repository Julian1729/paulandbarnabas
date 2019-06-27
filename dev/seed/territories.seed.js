/**
 * Territory Seed Data
 */
const {ObjectId} = require('mongodb');

let fragments =
[
  {
    number: 1,
    blocks: [],
    assignment_history: [],
    worked: []
  },
  {
    number: 2,
    blocks: [],
    assignment_history: [],
    worked: []
  }
];

let streets =
[
  {
    name: 'Oakland',
    hundreds: [
      // 4500 Oakland
      {
        hundred: 4500,
        // 4500 Oakland odd
        odd: {
          tags: [],
          worked: [],
          units: [
            {
              number: 4501,
              name: null,
              subunits: [],
              tags: [],
              householders: [
                {
                  name: "John Doe",
                  email: "john@example.com",
                  phone_number: "2153459999",
                  gender: "male"
                }
              ],
              visits: [
                {
                  householders_contacted: "John Doe",
                  contacted_by: "Todd Roberson",
                  nowcalledon: false,
                  details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac pulvinar elit. Aliquam egestas sed neque sed porttitor. Cras lacinia rutrum velit eget convallis. Nunc lacus sem, congue tincidunt finibus id, tincidunt et odio",
                  timestamp: new Date("2019-03-06 16:57:50.624Z").getTime()
                }
              ],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4503,
              name: null,
              subunits: [],
              tags: [],
              householders: [
                {
                  name: "Kareem",
                  gender: "male"
                },
                {
                  name: "Tonya",
                  gender: "female"
                }
              ],
              visits: [
                {
                  householders_contacted: ["Kareem"],
                  contacted_by: "Todd Roberson",
                  nowcalledon: false,
                  details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac pulvinar elit. Aliquam egestas sed neque sed porttitor. Cras lacinia rutrum velit eget convallis. Nunc lacus sem, congue tincidunt finibus id, tincidunt et odio",
                  timestamp: new Date("2016-07-27T07:45:00Z").getTime()
                },
                {
                  householders_contacted: ["Kareem", "Tonya"],
                  contacted_by: "Todd Roberson",
                  nowcalledon: false,
                  details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ac pulvinar elit. Aliquam egestas sed neque sed porttitor. Cras lacinia rutrum velit eget convallis. Nunc lacus sem, congue tincidunt finibus id, tincidunt et odio",
                  timestamp: new Date("2018-09-27T11:45:00Z").getTime()
                }
              ],
              isdonotcall: false,
              language: null,
              notes: [
                {
                  by: 'Julian Hernandez',
                  note: 'Someone looked out the window but didn\t answer'
                }
              ],
              iscalledon: false
            },
            {
              number: 4505,
              name: null,
              subunits: [
                {
                  name: "Apt 1",
                  tags: [],
                  householders: [],
                  visits: [],
                  isdonotcall: false,
                  language: null,
                  notes: [
                    {
                      by: 'Tracy Scott',
                      note: 'very large dog outside'
                    }
                  ],
                  iscalledon: false
                },
                {
                  name: "Apt 2",
                  tags: [],
                  householders: [],
                  visits: [],
                  isdonotcall: false,
                  language: null,
                  notes: [],
                  iscalledon: false
                }
              ],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4507,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4509,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
          ],
        },
        // 4500 Oakland even
        even: {
          worked: [],
          units: [
            {
              number: 4500,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4502,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4504,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4506,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4508,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4510,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            }
          ]
        }
      },
      // 4600 Oakland
      {
        hundred: 4600,
        // 4600 Oakland odd
        odd: {
          worked: [

          ],
          units: [
            {
              number: 4601,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4603,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4605,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4607,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4609,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
          ],
        },
        // 4600 Oakland even
        even: {
          worked: [],
          units: [
            {
              number: 4600,
              name: null,
              subunits: [
                {
                  name: 'Apt 1',
                  tags: ['irrate'],
                  householders: [],
                  visits: [],
                  isdonotcall: false,
                  language: null,
                  notes: [],
                  iscalledon: false
                },
                {
                  name: 'Apt 2',
                  tags: [],
                  householders: [],
                  visits: [],
                  isdonotcall: false,
                  language: null,
                  notes: [],
                  iscalledon: false
                }
              ],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4602,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: true,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4604,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: true
            },
            {
              number: 4606,
              name: null,
              subunits: [],
              tags: ['beware of dog'],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4608,
              name: null,
              subunits: [],
              tags: ['no soliciting'],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4610,
              name: null,
              subunits: [],
              tags: ['no trespassing'],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4612,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 4614,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            }
          ]
        }
      },

    ],
    tags: ['low steps']
  },
  {
    name: 'Wakeling',
    hundreds: [
      // 1200 Wakeling
      {
        hundred: 1200,
        // 1200 Wakeling odd
        odd: {
          tags: [],
          worked: [],
          units: [
            {
              number: 1201,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1203,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1205,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1207,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1209,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1211,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1215,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1219,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1221,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1223,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
          ]
        },
        // 1200 Wakeling even
        even: {
          tags: [],
          worked: [],
          units: [
            {
              number: 1204,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1206,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1208,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1210,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1212,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1214,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
            {
              number: 1216,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            },
          ]
        }
      }
    ],
  },
  {
    name: 'Overington',
    hundreds: [
      // 1500 Overington
      {
        hundred: 1500,
        // 1500 Overington odd
        odd: {
          tags: [],
          worked: [],
          units: []
        },
        // 1500 Overington even
        even: {
          tags: [],
          worked: [],
          units: [
            {
              number: 1502,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            }
          ]
        }
      },
      // 1400 Overington
      {
        hundred: 1400,
        // 1400 Overington odd
        odd: {
          tags: [],
          worked: [],
          units: [
            {
              number: 1401,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            }
          ]
        },
        // 1400 Overington even
        even: {
          tags: [],
          worked: [],
          units: [
            {
              number: 1402,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            }
          ]
        }
      },
      // 1300 Overington
      {
        hundred: 1300,
        // 1300 Overington odd
        odd: {
          tags: [],
          worked: [],
          units: [
            {
              number: 1305,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            }
          ]
        },
        // 1300 Overington even
        even: {
          tags: [],
          worked: [],
          units: [
            {
              number: 1302,
              name: null,
              subunits: [],
              tags: [],
              householders: [],
              visits: [],
              isdonotcall: false,
              language: null,
              notes: [],
              iscalledon: false
            }
          ]
        }
      },
    ],
  }
];

let territory1 = {
  congregation: new ObjectId(),
  fragments: fragments,
  streets: streets
};

module.exports = [territory1];
