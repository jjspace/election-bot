const { MessageEmbed } = require('discord.js');
const dbClient = require('../../db/dbClient');
const { withServerDB } = require('../commandMods');

const positions = {
  name: 'positions',
  description: 'Display the current positions',
  execute(serverDb, message) {
    const positions = dbClient.getPositions(serverDb);

    const fields = [];

    positions.forEach((position) => {
      fields.push({
        name: `**${position.name || position.id}** (${position.id})`,
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

module.exports = withServerDB(positions);
