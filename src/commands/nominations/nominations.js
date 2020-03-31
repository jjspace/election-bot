const { MessageEmbed } = require('discord.js');
const dbClient = require('../../db/dbClient');

// https://birdie0.github.io/discord-webhooks-guide/other/field_limits.html
const LIMITS = {
  USERNAME: 32,
  CONTENT: 2000,
  EMBEDS: 10,
  FILE: 10,
  TITLE: 256,
  DESCRIPTION: 2048,
  AUTHOR_NAME: 256,
  FIELDS: 25,
  FIELD_NAME: 256,
  FIELD_VALUE: 1024,
  FOOTER_TEXT: 2048,
  SUM_CHAR_IN_EMBED: 6000,
};

module.exports = {
  name: 'nominations',
  description: 'List out current nominations',
  usage: 'nominations [? @mention | positionId]',
  execute(message, args) {
    if (!this.serverDb) {
      throw new Error('Missing ServerDb');
    }

    if (args.length > 1) {
      message.channel.send('Too many arguments, max 1');
      return;
    }

    const nomListStr = list => {
      let nomStr = list
        .map(nom => {
          const nomMention = message.guild.member(nom.userId);
          const count = nom.nominators.length;
          const nominatorsStr = nom.nominators.map(user => message.guild.member(user)).join(', ');
          return `${nomMention} (${count}): ${nominatorsStr}`;
        })
        .join('\n');
      if (nomStr.length > LIMITS.FIELD_VALUE) {
        nomStr = list
          .map(nom => {
            const nomMention = message.guild.member(nom.userId);
            const count = nom.nominators.length;
            return `${nomMention} (${count})`;
          })
          .join('\n');
      }
      return nomStr;
    };

    // === User specified ===
    if (message.mentions.users.size) {
      const nominee = message.mentions.users.first();

      const title = `Nominations for **${nominee.username}**`;
      const noms = dbClient.getNominations(this.serverDb, { userId: nominee.id });
      const positions = dbClient.getPositions(this.serverDb);
      const fields = noms.map(nom => {
        const position = positions.find(pos => pos.id === nom.positionId);
        return {
          name: `**${position.name}** (${position.id})`,
          value: nomListStr([nom]),
        };
      });

      const embed = new MessageEmbed({
        title,
        fields,
      });
      message.channel.send(embed);
      return;
    }

    // === Position id specified ===
    const positionId = args.shift();
    if (positionId) {
      const position = dbClient.getPosition(this.serverDb, positionId);
      if (!position) {
        message.channel.send(`Position with id (${positionId}) does not exist`);
        return;
      }
      const title = `Nominations for **${position.name}** (${position.id})`;
      const noms = dbClient.getNominations(this.serverDb, { positionId: position.id });
      const description = noms.length ? nomListStr(noms) : 'None yet';

      const embed = new MessageEmbed({
        title,
        description,
      });
      message.channel.send(embed);
      return;
    }

    // === No subset specified ===
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
    return;
  },
};
