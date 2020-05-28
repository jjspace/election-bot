const dbClient = require('../../db/dbClient');
const { withServerDB } = require('../commandMods');

const voterrole = {
  name: 'voterrole',
  description: "set the voter's role. This is the list of people that will be Direct Messaged",
  usage: 'voterrole [role]',
  execute(serverDb, message) {
    const mentionedRoles = message.mentions.roles;
    if (mentionedRoles.size > 1) {
      message.channel.send('Must mention one and only one role');
      return;
    } else if (mentionedRoles.size === 1) {
      const mentionedRole = mentionedRoles.first();
      const roleId = mentionedRole.id;

      dbClient.setVoterRole(serverDb, roleId);
      message.channel.send(`Set voter role`);
      return;
    } else {
      const voterRole = dbClient.getVoterRole(serverDb);
      const roleMention = message.guild.roles.get(voterRole).toString();
      message.channel.send(`Voter Role currently: ${roleMention}`);
      return;
    }
  },
};

module.exports = withServerDB(voterRole);
