const {
  MessageMentions: { USERS_PATTERN },
} = require('discord.js');
const dbClient = require('../../db/dbClient');
const { withServerDB } = require('../commandMods');

const nominate = {
  name: 'nominate',
  description: 'Nominate a server member for a position',
  usage: 'nominate [@mention] [position id]',
  arguments: {
    exact: 2,
    errorMsg: {
      highMsg: 'Too many arguments, max 2, one name and one position id',
      lowMsg: 'Not enough arguments, require 2, name and position id',
    },
    structure: [
      [USERS_PATTERN, /.*/],
      [/.*/, USERS_PATTERN],
    ],
  },
  execute(serverDb, message, args) {
    const mentionedUsers = message.mentions.users;
    const nominatorId = message.author.id;

    if (mentionedUsers.size !== 1) {
      message.channel.send('Must mention one user');
      return;
    }

    let positionId = args.pop();
    if (positionId.match(USERS_PATTERN)) {
      // if the second arg is the mention, pop again to try and use the first as posId
      positionId = args.pop();
    }
    const mentionedUser = mentionedUsers.first();
    const userId = mentionedUser.id;

    if (!dbClient.getPosition(serverDb, positionId)) {
      message.channel.send(`Position id "${positionId}" does not exist`);
      return;
    }

    const currentNom = dbClient.getNomination(serverDb, userId, positionId);
    if (currentNom && currentNom.nominators.includes(nominatorId)) {
      message.channel.send(`You've already nominated this user, no duplicates`);
      return;
    }

    // TODO: add a way to disallow nominating certain people. Specifically the election bot itself
    dbClient.addNomination(serverDb, userId, positionId, nominatorId);
    message.channel.send('Nomination added');
  },
};

module.exports = withServerDB(nominate);
