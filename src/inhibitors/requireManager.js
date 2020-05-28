const { Permissions } = require('discord.js');
const db = require('../db/db');
const dbClient = require('../db/dbClient');
const logger = require('../logger');

function isManager(serverDb, sender) {
  const { roles, users } = dbClient.getManagers(serverDb);

  // Always allow server Admins and those with Manage Server
  const { permissions } = sender;
  if (
    permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
    permissions.has(Permissions.FLAGS.MANAGE_GUILD)
  ) {
    logger.verbose('isManager: command allowed because of permissions');
    return true;
  }

  // If there are no managers set
  if (!roles.length && !users.length) {
    logger.verbose('isManager: command allowed because no managers set');
    return true;
  }

  // Check Roles
  for (let i = 0; i < roles.length; i++) {
    if (sender.roles.cache.has(roles[i])) {
      logger.verbose(`isManager: command allowed because sender has manager role: ${roles[i]}`);
      return true;
    }
  }

  // Check Users
  if (users.includes(sender.id)) {
    logger.verbose(`isManager: command allowed because user id is a manager: ${sender.id}`);
    return true;
  }

  logger.verbose('isManager: command not allowed, not valid permission');
  return false;
}

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
