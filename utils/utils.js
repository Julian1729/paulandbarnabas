/**
 * Testing Utilities
 */

const clearCollection = (model) => {

  return model.deleteMany({});
  
};

module.exports = {
  clearCollection
};
