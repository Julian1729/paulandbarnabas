/**
 * Testing Utilities
 */

const clearCollection = (model) => {

  return model.deleteMany({});

};

const collectFormData = (fields, req) => {
  var formData = {};

  for (var i = 0; i<fields.length; i++) {
    // pass null if field is undefined
    var key = fields[i];
    // OPTIMIZE: always pulling data from body
    // possibly give option to pull from another object
    if(req.body[key] === undefined){
      formData[key] = null;
    }else{
      formData[key] = req.body[key];
    }

  }

  return formData;

};

module.exports = {
  clearCollection,
  collectFormData
};
