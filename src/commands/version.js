var pjson = require('../../package.json');
const botDev = require('../inhibitors/botDev');

module.exports = {
  name: 'version',
  description: 'Display active version',
  hidden: true,
  inhibitors: [botDev],
  execute(message) {
    message.channel.send(`Current version: ${pjson.version}`);
  },
};
