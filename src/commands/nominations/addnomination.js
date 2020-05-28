const {
  MessageMentions: { USERS_PATTERN },
} = require('discord.js');
const dbClient = require('../../db/dbClient');
const { withServerDB } = require('../commandMods');
const { noMentionOpts, positionIdPattern } = require('../../utils');
const requireManager = require('../../inhibitors/requireManager');

const addnomination = {
  name: 'addnomination',
  description:
    "Add a member's nomination. Think 'Add nomination for position's nominee from nominator'",
  usage: 'addnomination [position id] [@nominee] [@nominator]',
  arguments: {
    exact: 3,
    errorMsg: {
      highMsg: 'Wrong number of arguments, require 3, `[position id] [@nominee] [@nominator]`',
      lowMsg: 'Wrong number of arguments, require 3, `[position id] [@nominee] [@nominator]`',
      structMsg: 'Wrong type of arguments, `[position id] [@nominee] [@nominator]`',
    },
    structure: [positionIdPattern, USERS_PATTERN, USERS_PATTERN],
  },
  inhibitors: [requireManager],
  execute(serverDb, message, args) {
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

    const currentNom = dbClient.getNomination(serverDb, nomineeId, positionId);
    if (currentNom && currentNom.nominators.includes(nominatorId)) {
      message.channel.send(`That nomination already exists`);
      return;
    }

    dbClient.addNomination(serverDb, nomineeId, positionId, nominatorId);
    message.channel.send(
      `Added nomination of ${nomineeMention} for (${positionId}) from ${nominatorMention}`,
      noMentionOpts
    );
    return;
  },
};

module.exports = withServerDB(addnomination);
