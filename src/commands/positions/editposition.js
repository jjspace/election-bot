const dbClient = require('../../db/dbClient');
const { withServerDB } = require('../commandMods');

const PositionProps = ['name', 'desc'];
const propDisplay = PositionProps.map((p) => `"${p}"`).join(', ');

const editposition = {
  name: 'editposition',
  description: "Edit a position's details",
  usage: 'editposition [position id] ["name"|"desc"] [new value]',
  arguments: { min: 3, errorMsg: { lowMsg: 'Must provide an id, property and new value' } },
  restricted: true,
  execute(serverDb, message, args) {
    const positionId = args.shift();
    const positionProp = args.shift();
    const newVal = args.join(' ');

    if (!dbClient.getPosition(serverDb, positionId)) {
      message.channel.send(`Position with id "${positionId}" does not exist`);
      return;
    }

    if (!PositionProps.includes(positionProp)) {
      message.channel.send(
        `Position property: ${positionProp} not valid. Must be one of: ${propDisplay}`
      );
      return;
    }

    dbClient.editPosition(serverDb, positionId, { [positionProp]: newVal });
    message.channel.send(`Position updated`);
    return;
  },
};

module.exports = withServerDB(editposition);
