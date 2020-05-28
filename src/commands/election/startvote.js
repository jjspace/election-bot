const dbClient = require('../../db/dbClient');
const requireManager = require('../../inhibitors/requireManager');

module.exports = {
  name: 'startvote',
  description: 'Initiate a vote for the specified position',
  usage: 'startvote [position id]',
  inhibitors: [requireManager],
  execute(message, args) {
    if (!this.serverDb) {
      throw new Error('Missing ServerDb');
    }

    if (args.length !== 1) {
      message.channel.send('Incorrect number of arguments, only 1');
      return;
    }

    const positionId = args.shift();

    if (!dbClient.getPosition(this.serverDb, positionId)) {
      message.channel.send(`Position id "${positionId}" does not exist`);
      return;
    }

    const nominees = dbClient.getNominations(this.serverDb, { positionId });
    const voterRole = dbClient.getVoterRole(this.serverDb);

    const voters = message.guild.roles.get(voterRole).members;

    message.channel.send(`Sending messages to ${voters} for ${nominees.map((n) => n.userId)}`);
    voters.forEach((member) => {
      member.send('testing vote').then((dm) => message.channel.send(`DM to ${member} is ${dm.id}`));
    });
  },
};
