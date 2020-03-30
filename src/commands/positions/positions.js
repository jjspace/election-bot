const { MessageEmbed } = require('discord.js');
const dbClient = require('../../db/dbClient');

module.exports = {
  name: 'positions',
  description: 'Display the current positions',
  execute(message) {
    if (!this.serverDb) {
      throw new Error('Missing ServerDb');
    }

    const positions = dbClient.getPositions(this.serverDb);

    const fields = [];

    positions.forEach(position => {
      fields.push({
        name: `**${position.name}** (${position.id})`,
        value: position.desc || 'No Description',
      });
    });

    const embed = new MessageEmbed({
      title: 'Postions',
      fields,
    });
    message.channel.send(embed);
    return;
  },
};
