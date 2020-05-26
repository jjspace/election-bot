const { MessageEmbed } = require('discord.js');
const dbClient = require('../../db/dbClient');
const { withServerDB } = require('../commandMods');

const managers = {
  name: 'managers',
  description: 'List manager roles or users',
  execute(serverDb, message) {
    const { roles, users } = dbClient.getManagers(serverDb);

    const roleMentions = roles.map((roleId) => message.guild.roles.cache.get(roleId));
    const userMentions = users.map((userId) => message.guild.member(userId));
    let fields = [];
    if (roleMentions.length) {
      fields.push({
        name: 'Roles:',
        value: roleMentions.join('\n'),
      });
    }
    if (userMentions.length) {
      fields.push({
        name: 'Users:',
        value: userMentions.join('\n'),
      });
    }
    const embed = new MessageEmbed({
      title: 'Managers',
      fields,
    });
    message.channel.send(embed);
  },
};

module.exports = withServerDB(managers);
