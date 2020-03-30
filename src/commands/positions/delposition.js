const dbClient = require('../../db/dbClient');

module.exports = {
  name: 'delposition',
  description: 'Remove a position',
  usage: 'delposition [position id]',
  restricted: true,
  execute(message, args) {
    if (!this.serverDb) {
      throw new Error('Missing ServerDb');
    }

    if (args.length !== 1) {
      message.channel.send('Must only provide an id');
      return;
    }

    const positionId = args.shift();

    if (!dbClient.getPosition(this.serverDb, positionId)) {
      message.channel.send(`Position with id "${positionId}" does not exist`);
      return;
    }

    dbClient.removePosition(this.serverDb, positionId);
    message.channel.send(`Position removed`);
    return;
  },
};
