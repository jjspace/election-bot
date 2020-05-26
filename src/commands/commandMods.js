const db = require('../db/db');
const dbClient = require('../db/dbClient');

/**
 * @typedef Command
 * @type {object}
 * @property {string} name - command name, also how it's called
 * @property {string} description - command description shown in help page
 * @property {string} [usage] - usage example shown in help page
 * @property {boolean} [restricted] - whether this command has restricted access
 * @property {function(string, Array):undefined} execute
 */
/**
 * @typedef ServerDBCommand
 * @type {object}
 * @property {string} name - command name, also how it's called
 * @property {string} description - command description shown in help page
 * @property {string} [usage] - usage example shown in help page
 * @property {boolean} [restricted] - whether this command has restricted access
 * @property {function(object, string, array)} execute
 */

/**
 *
 * @param {ServerDBCommand} command Command requiring the serverDB hook
 * @returns {Command} Normalized command ready to be executed
 */
module.exports.withServerDB = (command) => {
  return {
    ...command,
    execute(message, args) {
      const serverDb = dbClient.getServer(db, message.guild.id);
      if (!serverDb) {
        throw new Error('Missing ServerDb');
      }
      return command.execute(serverDb, message, args);
    },
  };
};
