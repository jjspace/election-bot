const cmdString = ({ name, usage, description, inhibitors }) =>
  `**\`${name}\`${inhibitors ? '*' : ''}** ${usage ? ` - ${usage}` : ''}\n${description || ''}`;

module.exports = (commands) => {
  let fullHelpText = '**`help`**\nDisplay this help page\n';
  fullHelpText += commands
    .filter((cmd) => !cmd.hidden)
    .map(cmdString)
    .join('\n');

  let hasInhibitedCmds = commands.find((cmd) => cmd.inhibitors);

  return {
    name: 'help',
    description: 'Displays help for all commands or a specific command',
    usage: 'help [?command]',
    execute(message, args) {
      if (args.length > 1) {
        message.channel.send('Too many arguments provided');
        return;
      }
      let helpText = fullHelpText;
      if (hasInhibitedCmds) {
        helpText += '\nCommands marked with `*` may have restricted use';
      }

      const targetCmd = args.shift();
      if (targetCmd) {
        const command = commands.get(targetCmd);
        if (!command || (command && command.hidden)) {
          helpText = 'Unrecognized command';
        } else {
          helpText = cmdString(command);
          if (command.inhibitors) {
            helpText += '\nThis command may have restricted use';
          }
        }
      }

      message.channel.send(helpText);
    },
  };
};
