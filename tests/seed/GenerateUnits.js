var valid = [

  {
    block_hundred: 4500,
    odd_even: 1,
    generate_from: 4500,
    generate_to: 4550
  }

];

var invalid = [

  /**
   * Block hundred is required
   */
  {
    block_hundred: null,
    odd_even: 1,
    generate_from: 4500,
    generate_to: 4550
  },

  /**
   * Generate from not integer
   */
  {
    block_hundred: 4500,
    odd_even: 1,
    generate_from: 4500.3,
    generate_to: 4550
  },

  /**
   * values not greater than
   */
  {
    block_hundred: 4500,
    odd_even: 1,
    generate_from: 4500,
    generate_to: 4200
  },

];

module.exports = {
  valid,
  invalid
};
