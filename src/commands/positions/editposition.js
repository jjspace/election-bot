const dbClient = require('../../db/dbClient');

const PositionProps = ['name', 'desc'];
const propDisplay = PositionProps.map(p => `"${p}"`).join(', ');

module.exports = {
  name: 'editposition',
  description: "Edit a position's details",
  usage: 'editposition [position id] ["name"|"desc"] [new value]',
  restricted: true,
  execute(message, args) {
    if (!this.serverDb) {
      throw new Error('Missing ServerDb');
    }

    if (args.length < 3) {
      message.channel.send('Must provide an id, property and new value');
      return;
    }

    const positionId = args.shift();
    const positionProp = args.shift();
    const newVal = args.join(' ');

    if (!dbClient.getPosition(this.serverDb, positionId)) {
      message.channel.send(`Position with id "${positionId}" does not exist`);
      return;
    }

    if (!PositionProps.includes(positionProp)) {
      message.channel.send(
        `Position property: ${positionProp} not valid. Must be one of: ${propDisplay}`
      );
      return;
    }

    dbClient.editPosition(this.serverDb, positionId, { [positionProp]: newVal });
    message.channel.send(`Position updated`);
    return;
  },
};
