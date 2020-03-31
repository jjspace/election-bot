const { MessageMentions } = require('discord.js');
const dbClient = require('../../db/dbClient');

module.exports = {
  name: 'nominate',
  description: 'Nominate a server member for a position',
  usage: 'nominate [@mention] [position id]',
  execute(message, args) {
    if (!this.serverDb) {
      throw new Error('Missing ServerDb');
    }

    if (args.length !== 2) {
      message.channel.send('Improper number of arguments, require 2');
      return;
    }

    const mentionedUsers = message.mentions.users;
    const nominatorId = message.author.id;

    if (mentionedUsers.size !== 1) {
      message.channel.send('Must mention one user');
      return;
    }

    let positionId = args.pop();
    if (positionId.match(MessageMentions.USERS_PATTERN)) {
      // if the second arg is the mention, pop again to try and use the first as posId
      positionId = args.pop();
    }
    const mentionedUser = mentionedUsers.first();
    const userId = mentionedUser.id;

    if (!dbClient.getPosition(this.serverDb, positionId)) {
      message.channel.send(`Position id "${positionId}" does not exist`);
      return;
    }

    const currentNom = dbClient.getNomination(this.serverDb, userId, positionId);
    if (currentNom && currentNom.nominators.includes(nominatorId)) {
      message.channel.send(`You've already nominated this user, no duplicates`);
      return;
    }

    // TODO: add a way to disallow nominating certain people. Specifically the election bot itself
    dbClient.addNomination(this.serverDb, userId, positionId, nominatorId);
    message.channel.send('Nomination added');
  },
};
