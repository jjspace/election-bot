const dbClient = require('../../db/dbClient');

module.exports = {
  name: 'addmanager',
  description: 'Add manager role or user',
  usage: 'addmod [userMention|roleMention]',
  restricted: true,
  execute(message) {
    if (!this.serverDb) {
      throw new Error('Missing ServerDb');
    }

    // TODO: make more lenient with plaintext args for role names
    //       check against message.guild.roles for valid role name
    const mentionedRoles = message.mentions.roles;
    const mentionedUsers = message.mentions.users;
    if (
      (mentionedRoles.size !== 1 && mentionedUsers.size !== 1) ||
      (mentionedRoles.size === 1 && mentionedUsers.size === 1)
    ) {
      message.channel.send('Must mention one and only one role/user to add');
      return;
    }

    // TODO: add a check to make sure you're not removing your own ability to be manager
    // for example, if none are set and you're not setting it to a role you have access to

    // === Role Mention ===
    if (mentionedRoles.size) {
      const mentionedRole = mentionedRoles.first();
      const roleId = mentionedRole.id;
      const mention = mentionedRole.toString();

      const currManagers = dbClient.getManagers(this.serverDb);
      if (currManagers.roles.includes(roleId)) {
        message.channel.send(`${mention} already allowed`);
        return;
      }
      dbClient.addManagerRole(this.serverDb, roleId);
      message.channel.send(`Added role ${mention}`);
      return;
    }

    // === Member Mention ===
    if (mentionedUsers.size) {
      const mentionedUser = mentionedUsers.first();
      const userId = mentionedUser.id;
      const mention = mentionedUser.toString();

      const currManagers = dbClient.getManagers(this.serverDb);
      if (currManagers.users.includes(userId)) {
        message.channel.send(`${mention} already allowed`);
        return;
      }
      dbClient.addManagerUser(this.serverDb, userId);
      message.channel.send(`Added user ${mention}`);
      return;
    }
  },
};
