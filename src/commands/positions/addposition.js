const dbClient = require('../../db/dbClient');
const { withServerDB } = require('../commandMods');
const requireManager = require('../../inhibitors/requireManager');

const addPosition = {
  name: 'addposition',
  description: 'Add an elected position. If a name is not provided the id will be used',
  usage: 'addposition [position id] [position name?]',
  arguments: { min: 1, errorMsg: 'Must provide a name/id' },
  inhibitors: [requireManager],
  execute(serverDb, message, args) {
    const positionId = args.shift();
    let positionName = args.join(' ');
    if (!positionName) positionName = positionId;

    if (dbClient.getPosition(serverDb, positionId)) {
      message.channel.send(`Position with the id "${positionId}" already exists`);
      return;
    }

    // TODO: consider adding a way to do description all in one go
    dbClient.addPosition(serverDb, positionId, positionName);
    message.channel.send(
      `${positionName || positionId} has been added with the id: "${positionId}"`
    );
    return;
  },
};

module.exports = withServerDB(addPosition);
