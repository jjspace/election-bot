const dbClient = require('../../db/dbClient');
const { withServerDB } = require('../commandMods');

const prefix = {
  name: 'prefix',
  usage: 'prefix [prefixCharacter]',
  description: 'Set the prefix to use for commands for this bot',
  arguments: { exact: 1, errorMsg: 'Wrong number of arguments, requires 1' },
  restricted: true,
  execute(serverDb, message, args) {
    const newPrefix = args.shift();

    dbClient.setCommandPrefix(serverDb, newPrefix);
    message.channel.send(`Command Prefix updated to \`${newPrefix}\``);
  },
};

module.exports = withServerDB(prefix);
