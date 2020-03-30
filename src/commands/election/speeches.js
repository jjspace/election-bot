const { MessageEmbed } = require('discord.js');
const { shuffle } = require('lodash');
const dbClient = require('../../db/dbClient');

module.exports = {
  name: 'speeches',
  description: 'Output an order for speeches to occur',
  usage: 'speeches [?position id]',
  restricted: true,
  execute(message, args) {
    if (!this.serverDb) {
      throw new Error('Missing ServerDb');
    }

    if (args.length > 1) {
      message.channel.send('Too many arguments, max 1');
      return;
    }

    const nomListStr = list =>
      list
        .map((nom, i) => {
          const nomMention = message.guild.member(nom.userId);
          return `${i + 1}) ${nomMention}`;
        })
        .join('\n');

    if (args.length) {
      const positionId = args.shift();
      const position = dbClient.getPosition(this.serverDb, positionId);
      const nominees = dbClient.getNominations(this.serverDb, { positionId });

      const embed = new MessageEmbed({
        title: `Speech order for **${position.name}**`,
        description: nominees.length
          ? nomListStr(shuffle(nominees))
          : 'No nominees for this position',
      });

      message.channel.send(embed);
    } else {
      const positions = dbClient.getPositions(this.serverDb);

      const fields = positions.map(pos => {
        const noms = dbClient.getNominations(this.serverDb, { positionId: pos.id });
        return {
          name: `**${pos.name}**`,
          value: noms.length ? nomListStr(shuffle(noms)) : 'No nominees for this position',
        };
      });

      const embed = new MessageEmbed({
        title: 'Speech order for this election',
        fields,
      });
      message.channel.send(embed);
    }
  },
};
