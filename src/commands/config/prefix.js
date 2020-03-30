const dbClient = require('../../db/dbClient');

module.exports = {
  name: 'prefix',
  usage: 'prefix [prefixCharacter]',
  description: 'Set the prefix to use for commands for this bot',
  restricted: true,
  execute(message, args) {
    if (!this.serverDb) {
      throw new Error('Missing ServerDb');
    }

    if (args.length !== 1) {
      message.channel.send('Improper number of arguments, requires 1');
      return;
    }

    const newPrefix = args.shift();

    dbClient.setCommandPrefix(this.serverDb, newPrefix);
    message.channel.send(`Command Prefix updated to \`${newPrefix}\``);
  },
};
