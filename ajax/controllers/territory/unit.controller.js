// Visits
/**
 * Add a visit record to a unit
 * Expecting in body: 'householders_contacted', 'contacted_by', 'details', 'timestamp', 'id'
 */
exports.addVisit = (req, res) => {

  let territory = req.app.locals.territory;
  let unit = territory.current.subunit || territory.current.unit;

  let visitData = _.pick(req.body, [
    'householders_contacted',
    'contacted_by',
    'details',
    'timestamp',
    'id'
  ]);

  let newVisit = unit.addVisit(visitData);

  territory.territory.save()
    .then(t => {
      return res.json({data: {id: newVisit._id.toString()}});
    })
    .catch(e => {
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    })

};

/**
 * Delete a visit record from a unit
 * Expecting in query: visit id
 */
exports.removeVisit = (req, res) => {

  let visitId = req.query.id || null;

  if(!visitId){
    return res.status(HttpStatus.NOT_ACCEPTABLE).send();
  }

  let territory = req.app.locals.territory;
  let unit = territory.current.subunit || territory.current.unit;

  unit.removeVisit(visitId)

  territory.territory.save()
    .then(t => {
      return res.send();
    })
    .catch(e => {
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    })

};

/**
 * Add subunits to unit
 * Expecting in body: { subunits: [ {name: 'Apt 1'}, {name: 'Apt 2'} ] }
 * OPTIMIZE: refactor addSubunits to allow adding more than just a name
 * and allow more than just a name to be send in body
 */
exports.addSubunit = (req, res) => {

  let territory = req.app.locals.territory;
  let unit = territory.current.unit;

  let subunitsToAdd = req.body.subunits;

  subunitsToAdd.forEach(subunitObj => {
    unit.addSubunit(subunitObj.name);
  });

  territory.territory.save()
    .then(t => {
      return res.send({
        data: {
          subunits: unit.subunits
        }
      });
    })
    .catch(e => {
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    })

};

/**
 * Remove subunit
 * Expecting in query: subunit id
 */
exports.removeSubunit = (req, res) => {

  let reqSubunitId = req.query.id;
  if(!reqSubunitId) return res.status(HttpStatus.NOT_ACCEPTABLE).send();

  let territory = req.app.locals.territory;
  let unit = territory.current.unit;

  unit.removeSubunit(reqSubunitId);

  territory.territory.save()
    .then(t => {
      return res.send();
    })
    .catch(e => {
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    })

};

/**
 * Add tag to unit or subunit
 */
exports.addTag = (req, res) => {

  let reqTag = req.query.tag;
  if(!reqTag) return res.status(HttpStatus.NOT_ACCEPTABLE).send();

  let territory = req.app.locals.territory;
  let unit = territory.current.subunit || territory.current.unit;

  unit.addTag(reqTag);

  territory.territory.save()
    .then(t => {
      return res.send();
    })
    .catch(e => {
      console.log(e.stack);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });

};

/**
 * Remove tag from unit or subunit
 */
exports.removeTag = (req, res) => {

  let reqTag = req.query.tag;
  if(!reqTag) return res.status(HttpStatus.NOT_ACCEPTABLE).send();

  let territory = req.app.locals.territory;
  let unit = territory.current.subunit || territory.current.unit;

  unit.removeTag(reqTag);

  territory.territory.save()
    .then(t => {
      return res.send();
    })
    .catch(e => {
      console.log(e.stack);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });

};

/**
 * Add housholder to unit or subunit
 */
exports.addHouseholder = (req, res) => {

  let reqHouseholder = req.body.householder;
  if(!reqHouseholder) return res.status(HttpStatus.NOT_ACCEPTABLE).send();

  let territory = req.app.locals.territory;
  let unit = territory.current.subunit || territory.current.unit;

  let name = reqHouseholder.name || null;
  let gender = reqHouseholder.gender || null;
  let email = reqHouseholder.email || null;
  let phone_number = reqHouseholder.phone_number || null;

  var householder = unit.addHouseholder(name, gender, email, phone_number);

  territory.territory.save()
    .then(t => {
      return res.json({data: {householder: householder}});
    })
    .catch(e => {
      console.log(e.stack);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });

};

/**
 * Remove a housholder from unit
 */
exports.removeHouseholder = (req, res) => {

  let reqHouseholder = req.query.id;
  if(!reqHouseholder) return res.status(HttpStatus.NOT_ACCEPTABLE).send();

  let territory = req.app.locals.territory;
  let unit = territory.current.subunit || territory.current.unit;

  unit.removeHouseholder(reqHouseholder);

  territory.territory.save()
    .then(t => {
      return res.send();
    })
    .catch(e => {
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });

};

/**
 * Add a note to unit or subunit
 */
exports.addNote = (req, res) => {

  let territory = req.app.locals.territory;
  let unit = territory.current.subunit || territory.current.unit;

  let reqNote = req.body;

  let note = unit.addNote(reqNote);

  territory.territory.save()
    .then(t => {
      return res.json({data: {note: note}});
    })
    .catch(e => {
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });

};

/**
 * Remove note from unit or subunit
 */
exports.removeNote = (req, res) => {

  let noteId = req.query.id;
  if(!noteId) return res.status(HttpStatus.NOT_ACCEPTABLE).send();

  let territory = req.app.locals.territory;
  let unit = territory.current.subunit || territory.current.unit;

  unit.removeNote(noteId);

  territory.territory.save()
    .then(t => {
      return res.send();
    })
    .catch(e => {
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });

};

/**
 * Set a meta property on unit
 * Expected in query: dnc || lang || calledon || name
 * (isdonotcall)
 * (language)
 * (iscalledon)
 * (name)
 */
exports.meta = (req, res) => {

  let territory = req.app.locals.territory;
  let unit = territory.current.subunit || territory.current.unit;

  // search for valid meta option in query
  // and store in option var
  let option = null;
  let value = null;
  [
    'dnc',
    'lang',
    'calledon',
    'name'
  ].forEach(opt => {
    if(req.query.hasOwnProperty(opt)){
      value = req.query[opt];
      return option = opt;
    }
  });

  if(!option){
    return res.status(HttpStatus.NOT_ACCEPTABLE).send();
  }

  var isFalseMeta = (val) => {
    return (val === 'false' || val === '0') ? false : true;
  };

  // update unit metadata
  switch (option) {
    case 'dnc':
      if(isFalseMeta(value)){
        unit.isdonotcall = true;
      }else{
        unit.isdonotcall = false;
      }
      break;
    case 'lang':
      unit.language = value;
      break;
    case 'calledon':
      if(isFalseMeta(value)){
        unit.iscalledon = true;
      }else{
        unit.iscalledon = false;
      }
      break;
    case 'name':
      unit.name = value;
      break;
    default:
      return res.send();
  }

  territory.territory.save()
    .then(t => {
      return res.json({data: {option, value}});
    })
    .catch(e => {
      console.log(e.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    });

};
