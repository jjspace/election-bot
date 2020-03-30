const {
  MessageMentions: { USERS_PATTERN },
} = require('discord.js');
const dbClient = require('../../db/dbClient');

module.exports = {
  name: 'delnomination',
  description: "Remove a member's nomination",
  usage: 'delnomination [position id] [@nominee] [@nominator]',
  restricted: true,
  execute(message, args) {
    if (!this.serverDb) {
      throw new Error('Missing ServerDb');
    }

    if (args.length !== 3) {
      message.channel.send('Improper number of arguments, require 3');
      return;
    }

    // We have to check this way because the order of message.mentions.users does not necessarily
    // match the order in the message
    const fullMessage = args.join(' ');
    const patt = new RegExp(
      `(?<positionId>\\w+)\\s+(?<nominee>${USERS_PATTERN.source})\\s+(?<nominator>${USERS_PATTERN.source})`
    );

    const match = fullMessage.match(patt);
    const { positionId, nominee, nominator } = match.groups;
    const nomineeId = nominee.match(USERS_PATTERN.source)[1];
    const nominatorId = nominator.match(USERS_PATTERN.source)[1];

    const nomineeMention = message.guild.member(nomineeId);
    const nominatorMention = message.guild.member(nominatorId);

    const currentNom = dbClient.getNomination(this.serverDb, nomineeId, positionId);
    if (currentNom && currentNom.nominators.includes(nominatorId)) {
      dbClient.removeNomination(this.serverDb, nomineeId, positionId, nominatorId);
      message.channel.send(
        `Nomination of ${nomineeMention} for (${positionId}) from ${nominatorMention} removed`
      );
      return;
    }

    message.channel.send("That nomination doesn't exist");
    return;
  },
};
