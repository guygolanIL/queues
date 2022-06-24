import { run } from './run/run';

export type Command = {
    execute: (flags: Flags) => Promise<void>;
    validateFlags: (flags: Flags) => void;
};

export type Flags = {[key: string]: string};


export function parseCommands(argsArray: string[]): [string, Flags] {
    const flags: Flags = {};

    const parsedArgs = process.argv.slice(2);
    let command = parsedArgs[0] || 'run';

    argsArray.forEach(arg => {
        let isFlag = arg.match(new RegExp('--.*=.*'));

        if (isFlag) {
            const [key, value] = arg.replace('--', '').split('=');
            flags[key] = value;
        }
    });

    return [command, flags];
}


const commands: { [key: string]: Command } = {
    run
}

export class CommandManager {
    runCommand(requestedCommand: string, flags: Flags) {
        const command: Command = this.getCommand(requestedCommand);
        command.validateFlags(flags);

        command.execute(flags);
    }

    private getCommand(requestedCommand: string): Command {
        const command: Command = commands[requestedCommand];
        if (!command) throw new Error(`no command ${requestedCommand}`);

        return command;
    }
}