import { CommandManager, parseCommands } from './commands/CommandManager';

(async function start() {
  const [command, flags] = parseCommands(process.argv);
  const commandManager = new CommandManager();

  try {
    commandManager.runCommand(command, flags);
  } catch(e) {
    return console.log(e);
  }
})();
