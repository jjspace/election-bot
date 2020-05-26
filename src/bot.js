const Discord = require('discord.js');
const { discordBotToken } = require('./config');
const logger = require('./logger');
const commands = require('./commands');
const db = require('./db/db');
const dbClient = require('./db/dbClient');
const isManager = require('./isManager');
const { validateArgs } = require('./utils');

const client = new Discord.Client();
client.commands = commands;
client.cooldowns = new Discord.Collection();

client.once('ready', () => {
  logger.info(
    `I am ready! I am "${client.user.username}" connected to ${client.guilds.cache.size} guilds`
  );
  if (process.send) {
    // send 'ready' for pm2
    process.send('ready');
  }
});

client.on('guildCreate', (guild) => {
  logger.info(
    `Invited to join new guild: "${guild.name || 'unknownName'}:${guild.id || 'unknownID'}"`
  );
  if (guild.available) {
    // recommended to see if guild is available before
    // performing operations or reading data from it.
    // you can check like this
    // guild.available indicates server outage

    const { id, name } = guild;

    const storedGuildId = dbClient.getServer(db, id);

    // check if we have config for it already
    // maybe they kicked the bot but want it back
    if (!storedGuildId.value()) {
      dbClient.addServer(db, id, name);
    }
  }
});

client.on('message', (message) => {
  const { guild, author, content } = message;

  logger.info(
    `Received message: "${message.content}" (${message.embeds.length} embeds) from "${
      author.username || 'unknownAuthor'
    }:${author.id || 'unknownId'}"`
  );

  // === Gatekeeping ===
  if (author === client.user) {
    logger.info('Message from myself, no action');
    return;
  }
  if (author.bot) {
    logger.info('Message from another bot, ignore');
    return;
  }
  if (guild === null) {
    logger.info('Message was a DM, alert and ignore');
    message.channel.send('This bot does not currently accept DMs');
    return;
  }

  // Load server database or generate default one
  const serverDb = dbClient.getServer(db, guild.id);
  if (!serverDb.value()) {
    logger.info(`serverDb not found for "${guild.name}:${guild.id}". Generating new default`);
    dbClient.addServer(db, guild.id, guild.name);
    message.channel.send(
      'Current Guild settings not found, defaults were generated.\nIf you think this is wrong contact the bot developer'
    );
    return;
  }
  logger.info(`Loaded serverDb for guild "${guild.name}:${guild.id}"`);

  const commandPrefix = dbClient.getCommandPrefix(serverDb);

  // === Message Handling ===
  if (content.startsWith(commandPrefix)) {
    const args = content.slice(commandPrefix.length).split(/\s+/);
    const commandName = args.shift().toLowerCase();

    // check for and retrieve command object
    if (!client.commands.has(commandName)) {
      message.channel.send(
        `Unrecognized command. Use \`${commandPrefix}help\` to see available commands`
      );
      return;
    }
    const command = client.commands.get(commandName);

    // Try executing the command, catch errors to log and alert
    try {
      // check permission to use this command
      if (command.restricted && !isManager(serverDb, message.member)) {
        message.channel.send('You do not have permission for this command');
        return;
      }

      // check arg count
      const argErrorMsg = validateArgs(args, command.arguments);
      if (command.arguments && argErrorMsg) {
        message.channel.send(argErrorMsg);
        return;
      }

      command.execute(message, args);
      return;
    } catch (error) {
      logger.error(error);
      message.reply('There was an error trying to execute that command!');
    }
  }
});

// Initiate bot login
client.login(discordBotToken);

// Shutdown safely
process.on('SIGINT', () => {
  logger.info('Caught Interupt Signal, quitting');

  client.destroy();
  process.exit();
});
