const { MessageMentions } = require('discord.js');
const dbClient = require('../../db/dbClient');
const { withServerDB } = require('../commandMods');
const { noMentionOpts } = require('../../utils');
const requireManager = require('../../inhibitors/requireManager');

const addmanager = {
  name: 'addmanager',
  description: 'Add manager role or user',
  usage: 'addmod [userMention|roleMention]',
  inhibitors: [requireManager],
  arguments: {
    exact: 1,
    errorMsg: {
      highMsg: 'You may only add one role/user at a time',
      lowMsg: 'You must specify a role/user to add',
    },
    structure: [[MessageMentions.USERS_PATTERN], [MessageMentions.ROLES_PATTERN]],
  },
  execute(serverDb, message) {
    // TODO: make more lenient with plaintext args for role names
    //       check against message.guild.roles for valid role name
    const mentionedRoles = message.mentions.roles;
    const mentionedUsers = message.mentions.users;
    if (
      (mentionedRoles.size !== 1 && mentionedUsers.size !== 1) ||
      (mentionedRoles.size === 1 && mentionedUsers.size === 1)
    ) {
      message.channel.send('You must mention a role/user to add them');
      return;
    }

    // TODO: add a check to make sure you're not removing your own ability to be manager
    // for example, if none are set and you're not setting it to a role you have access to

    // === Role Mention ===
    if (mentionedRoles.size) {
      const mentionedRole = mentionedRoles.first();
      const roleId = mentionedRole.id;
      const mention = mentionedRole.toString();

      const currManagers = dbClient.getManagers(serverDb);
      if (currManagers.roles.includes(roleId)) {
        message.channel.send(`${mention} already allowed`, noMentionOpts);
        return;
      }
      dbClient.addManagerRole(serverDb, roleId);
      message.channel.send(`Added role ${mention}`, noMentionOpts);
      return;
    }

    // === Member Mention ===
    if (mentionedUsers.size) {
      const mentionedUser = mentionedUsers.first();
      const userId = mentionedUser.id;
      const mention = mentionedUser.toString();

      const currManagers = dbClient.getManagers(serverDb);
      if (currManagers.users.includes(userId)) {
        message.channel.send(`${mention} already allowed`, noMentionOpts);
        return;
      }
      dbClient.addManagerUser(serverDb, userId);
      message.channel.send(`Added user ${mention}`, noMentionOpts);
      return;
    }
  },
};

module.exports = withServerDB(addmanager);
