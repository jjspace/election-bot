const { MessageEmbed } = require('discord.js');
const dbClient = require('../../db/dbClient');

module.exports = {
  name: 'nominations',
  description: 'List out current nominations',
  usage: 'nominations [? @mention | positionId]',
  execute(message, args) {
    if (!this.serverDb) {
      throw new Error('Missing ServerDb');
    }

    const nomListStr = list =>
      list
        .map(nom => {
          const nomMention = message.guild.member(nom.userId);
          const count = nom.nominators.length;
          const nominatorsStr = nom.nominators.map(user => message.guild.member(user)).join(', ');
          return `${nomMention} (${count}): ${nominatorsStr}`;
        })
        .join('\n');

    // TODO: add optional focus argument

    const positions = dbClient.getPositions(this.serverDb);
    const fields = positions.map(pos => {
      const noms = dbClient.getNominations(this.serverDb, { positionId: pos.id });
      return {
        name: `**${pos.name}** (${pos.id})`,
        value: noms.length ? nomListStr(noms) : 'None yet',
      };
    });

    const embed = new MessageEmbed({
      title: 'Nominations',
      fields,
    });
    message.channel.send(embed);
  },
};
