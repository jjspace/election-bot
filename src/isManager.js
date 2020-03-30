const { Permissions } = require('discord.js');
const dbClient = require('./db/dbClient');
const logger = require('./logger');

module.exports = function(serverDb, sender) {
  const { roles, users } = dbClient.getManagers(serverDb);

  // Always allow server Admins and those with Manage Server
  const { permissions } = sender;
  if (
    permissions.has(Permissions.FLAGS.ADMINISTRATOR) ||
    permissions.has(Permissions.FLAGS.MANAGE_GUILD)
  ) {
    logger.info('command allowed because of permissions');
    return true;
  }

  // If there are no managers set
  if (!roles.length && !users.length) {
    logger.info('command allowed because no managers set');
    return true;
  }

  // Check Roles
  for (let i = 0; i < roles.length; i++) {
    if (sender.roles.cache.has(roles[i])) {
      logger.info(`command allowed because sender has manager role: ${roles[i]}`);
      return true;
    }
  }

  // Check Users
  if (users.includes(sender.id)) {
    logger.info(`command allowed because user id is a manager: ${sender.id}`);
    return true;
  }

  logger.info('command not allowed, not valid permission');
  return false;
};
