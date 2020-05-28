const db = require('../db/db');
const dbClient = require('../db/dbClient');
const isManager = require('../isManager');

/**
 * @typedef Inhibition
 * @property {string} reason - reason for inhibition
 * @property {string} response - message to send back to the user
 */
/**
 * @param {string} message - message triggering the command
 * @returns {boolean | string | Inhibition} `false` if should not be blocked, string with reason if it should
 */
module.exports = function (message) {
  const serverDb = dbClient.getServer(db, message.guild.id);
  if (!serverDb) {
    throw new Error('Missing ServerDb');
  }
  if (!isManager(serverDb, message.member)) {
    return { reason: 'not-manager', response: 'You must be a manager to use this command' };
  }
  return false;
};
