const { MessageEmbed } = require('discord.js');
const dbClient = require('../../db/dbClient');

module.exports = {
  name: 'managers',
  description: 'List manager roles or users',
  execute(message) {
    if (!this.serverDb) {
      throw new Error('Missing ServerDb');
    }

    const { roles, users } = dbClient.getManagers(this.serverDb);

    const roleMentions = roles.map(roleId => message.guild.roles.cache.get(roleId));
    const userMentions = users.map(userId => message.guild.member(userId));
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
