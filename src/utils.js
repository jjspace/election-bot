module.exports.getRandElem = (items) => items[Math.floor(Math.random() * items.length)];

module.exports.noMentionOpts = {
  allowedMentions: { parse: [] },
};

module.exports.positionIdPattern = /^\w+$/;

/**
 * @typedef argErrorMessages
 * @property {string} [highMsg] - message to send if over the max
 * @property {string} [lowMsg] - message to send if under the min
 * @property {string} [structMsg] - message if the structure is not valid
 */
/**
 * @typedef argOpts
 * @property {number} [min] - must have more than this number, non-inclusive
 * @property {number} [max] - must have less than this number, non-inclusive
 * @property {number} [exact] - must have exactly this many, overrides min and max if set
 * @property {function | Array[]} - structure(s) of arguments
 * @property {string | argErrorMessages} [errorMsg] - override default warning messages
 */

/**
 * Validate a set of arguments against the command's requirements
 * Returns the error if there is one, otherwise null
 *
 * @param {string[]} args - array of arguments
 * @param {argOpts} argOpts - options controlling argument count
 * @returns {?string} Error message if there's a problem
 */
module.exports.validateArgs = (args, argOpts) => {
  // Don't perform checking if there's no specification
  if (!argOpts) {
    return null;
  }

  // Establish bounds
  let { min, max } = argOpts;
  const { exact, errorMsg, structure } = argOpts;
  if (exact) {
    min = exact;
    max = exact;
  }

  // Generate error messages depending on arguments
  let highMsg = `Too many arguments, max ${max} allowed`;
  let lowMsg = `Not enough arguments, min ${max} required`;
  let structMsg = 'Incorrect argument types';
  if (errorMsg && typeof errorMsg === 'string') {
    highMsg = errorMsg;
    lowMsg = errorMsg;
    structMsg = errorMsg;
  }
  if (errorMsg && typeof errorMsg === 'object') {
    if (errorMsg.highMsg) highMsg = errorMsg.highMsg;
    if (errorMsg.lowMsg) lowMsg = errorMsg.lowMsg;
    if (errorMsg.structMsg) structMsg = errorMsg.structMsg;
  }

  // Perform count checks
  if (args.length > max) {
    return highMsg;
  }
  if (args.length < min) {
    return lowMsg;
  }

  // check structure
  if (structure) {
    // a structure is an array of regular expressions
    // the structure may be one array or an array of possibilities

    // allow for a custom function should RegEx not meet the needs
    // Custom function will take the array of args and should return true if the structure is valid
    if (typeof structure === 'function') {
      if (!structure(args)) {
        return structMsg;
      }
      return null;
    }

    if (structure instanceof Array) {
      let structures = structure;
      if (!(structure[0] instanceof Array)) {
        // Assume if first element is not an array it's a full structure instead
        // of a list of structures and turn it into a list of them
        structures = [structure];
      }

      // check a list of multiple structures for any that are valid
      let structMatch = false;
      structures.forEach((struct) => {
        structMatch = structMatch || validArgStructure(args, struct);
      });
      if (!structMatch) {
        return structMsg;
      }
      return null;
    }

    throw new Error('Unrecognized command structure format:', structure);
  }

  return null;
};

/**
 * Check a list of arguments against their corresponding patterns. The length of args and structures must match
 *
 * @param {string[]} args - list of arguments to check
 * @param {RegExp[]} structure - array of expressions to match each arg against.
 */
function validArgStructure(args, structure) {
  // TODO: make this more open to allow for a "starting" structure with whatever after,
  // or a defined optional structure

  // must match in length to even consider checking
  if (args.length !== structure.length) {
    return false;
  }
  // check each part against each expression
  for (let i = 0; i < args.length; i++) {
    const part = args[i];
    const exp = structure[i];
    if (!part.match(exp)) {
      return false;
    }
  }
  return true;
}
