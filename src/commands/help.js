const cmdString = ({ name, usage, description, restricted }) =>
  `**\`${name}\`${restricted ? '*' : ''}** ${usage ? ` - ${usage}` : ''}\n${description || ''}`;

module.exports = commands => {
  let fullHelpText = '**`help`**\nDisplay this help page\n';
  fullHelpText += commands.map(cmdString).join('\n');

  let hasRestrictedCmds = commands.find(cmd => cmd.restricted);

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
      if (hasRestrictedCmds) {
        helpText += '\nCommands marked with `*` may only be used by managers';
      }

      const targetCmd = args.shift();
      if (targetCmd) {
        const command = commands.get(targetCmd);
        helpText = cmdString(command);
        if (command.restricted) {
          helpText += '\nThis command may only be used by managers';
        }
      }

      message.channel.send(helpText);
    },
  };
};
