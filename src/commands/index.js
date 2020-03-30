const Discord = require('discord.js');
const ping = require('./ping');
const helpGen = require('./help');
const prefix = require('./config/prefix');
const addManager = require('./managers/addmanager');
const delManager = require('./managers/delmanager');
const managers = require('./managers/managers');
const positions = require('./positions/positions');
const addposition = require('./positions/addposition');
const editposition = require('./positions/editposition');
const delposition = require('./positions/delposition');
const nominations = require('./nominations/nominations');
const nominate = require('./nominations/nominate');
const addnomination = require('./nominations/addnomination');
const delnomination = require('./nominations/delnomination');
const speeches = require('./election/speeches');

const commands = new Discord.Collection();

commands.set(ping.name, ping);
commands.set(prefix.name, prefix);
commands.set(addManager.name, addManager);
commands.set(delManager.name, delManager);
commands.set(managers.name, managers);
commands.set(positions.name, positions);
commands.set(addposition.name, addposition);
commands.set(editposition.name, editposition);
commands.set(delposition.name, delposition);
commands.set(nominations.name, nominations);
commands.set(nominate.name, nominate);
commands.set(addnomination.name, addnomination);
commands.set(delnomination.name, delnomination);
commands.set(speeches.name, speeches);

// Generate help command from command definitions
const help = helpGen(commands);
commands.set(help.name, help);

module.exports = commands;
