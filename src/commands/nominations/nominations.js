const { MessageEmbed } = require('discord.js');
const dbClient = require('../../db/dbClient');
const { withServerDB } = require('../commandMods');
const { EMBED_LIMITS } = require('../../enums');

const nominations = {
  name: 'nominations',
  description: 'List out current nominations',
  usage: 'nominations [? @mention | positionId]',
  arguments: { max: 1 },
  execute(serverDb, message, args) {
    const nomListStr = (list) => {
      let nomStr = list
        .map((nom) => {
          const nomMention = message.guild.member(nom.userId);
          const count = nom.nominators.length;
          const nominatorsStr = nom.nominators.map((user) => message.guild.member(user)).join(', ');
          return `\\+${nomMention} (${count}) – ${nominatorsStr}`;
        })
        .join('\n');
      if (nomStr.length > EMBED_LIMITS.FIELD_VALUE) {
        nomStr = list
          .map((nom) => {
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
      const noms = dbClient.getNominations(serverDb, { userId: nominee.id });
      const positions = dbClient.getPositions(serverDb);
      const fields = noms.map((nom) => {
        const position = positions.find((pos) => pos.id === nom.positionId);
        return {
          name: `**${position.name}** (${position.id})`,
          value: nomListStr([nom]),
        };
      });

      const embed = new MessageEmbed({
        title,
        description: fields.length ? null : 'None yet',
        fields,
      });
      message.channel.send(embed);
      return;
    }

    // === Position id specified ===
    const positionId = args.shift();
    if (positionId) {
      const position = dbClient.getPosition(serverDb, positionId);
      if (!position) {
        message.channel.send(`Position with id (${positionId}) does not exist`);
        return;
      }
      const title = `Nominations for **${position.name}** (${position.id})`;
      const noms = dbClient.getNominations(serverDb, { positionId: position.id });
      const description = noms.length ? nomListStr(noms) : 'None yet';

      const embed = new MessageEmbed({
        title,
        description,
      });
      message.channel.send(embed);
      return;
    }

    // === No subset specified ===
    const positions = dbClient.getPositions(serverDb);
    const fields = positions.map((pos) => {
      const noms = dbClient.getNominations(serverDb, { positionId: pos.id });
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

module.exports = withServerDB(nominations);
