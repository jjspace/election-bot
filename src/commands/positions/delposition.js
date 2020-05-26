const dbClient = require('../../db/dbClient');
const { withServerDB } = require('../commandMods');

const delposition = {
  name: 'delposition',
  description: 'Remove a position',
  usage: 'delposition [position id]',
  arguments: {
    exact: 1,
    errorMsg: { highMsg: 'Only one id is allowed', lowMsg: 'Must provide an id' },
  },

  restricted: true,
  execute(serverDb, message, args) {
    const positionId = args.shift();

    if (!dbClient.getPosition(serverDb, positionId)) {
      message.channel.send(`Position with id "${positionId}" does not exist`);
      return;
    }

    dbClient.removePosition(serverDb, positionId);
    message.channel.send(`Position removed`);
    return;
  },
};

module.exports = withServerDB(delposition);
