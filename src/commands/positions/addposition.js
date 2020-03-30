const dbClient = require('../../db/dbClient');

module.exports = {
  name: 'addposition',
  description: 'Add an elected position',
  usage: 'addposition [position id] [position name]',
  restricted: true,
  execute(message, args) {
    if (!this.serverDb) {
      throw new Error('Missing ServerDb');
    }

    if (!args.length) {
      message.channel.send('Must provide a name');
      return;
    }

    const positionId = args.shift();
    const positionName = args.join(' ');

    if (dbClient.getPosition(this.serverDb, positionId)) {
      message.channel.send(`Position with the id "${positionId}" already exists`);
      return;
    }

    // TODO: consider adding a way to do description all in one go
    dbClient.addPosition(this.serverDb, positionId, positionName);
    message.channel.send(`${positionName} has been added with the id: "${positionId}"`);
    return;
  },
};
