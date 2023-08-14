/*!
 * Custom commands handler for Minecraft Bedrock
 * 
 * Version: 0.1.0
 * Author: VYT
 * Source code: https://github.com/vytdev/custom-commands
 */

// ================================ //
//              Types               //
// ================================ //

/**
 * Command type parser for command arguments
 * @param argv The argument vector that was splited from the player's chat
 * @param argDef The command argument of the origin argument
 * @returns Parsing info
 */
export type CommandTypeParser = (argv: string[], argDef: CommandArgument) => {
    /**
     * The argument as parsed
     */
    result: any,
    /**
     * How many unparsed args was used for parsing
     */
    step?: number,
};

/**
 * Base interface for the command components
 */
export interface CommandBase {
    /**
     * The destination of the parsed argument on the args object
     */
    dest: string,
    /**
     * Help string for printing help
     */
    help?: string,
}

/**
 * Command argument definition
 */
export interface CommandArgument extends CommandBase {
    /**
     * Type parser for the argument
     */
    type: string | CommandTypeParser,
    /**
     * The name of the argument shown in printed help message
     */
    name?: string,
    /**
     * Whether this argument is required
     */
    required?: boolean,
    /**
     * Default value if arg isn't parsed from command
     */
    default?: any,
    /**
     * Additional options you can pass to the type parser
     */
    [key: string | number]: any,
}

/**
 * Command flag definition
 */
export interface CommandFlag extends CommandBase {
    /**
     * The long flag
     */
    long?: string,
    /**
     * The short on character flag
     */
    short?: string,
    /**
     * Arguments for the flag
     */
    args?: CommandArgument[],
}

/**
 * Commands/sub-commands
 */
export interface CommandBuilder extends CommandBase {
    /**
     * Name of the command/sub-command
     */
    name?: string,
    /**
     * Command/sub-command aliases
     */
    aliases?: string[],
    /**
     * Positional arguments
     */
    args?: CommandArgument[],
    /**
     * Flags
     */
    flags?: CommandFlag[],
    /**
     * Sub-commands
     */
    subcommands?: CommandBuilder[],
}

/**
 * The parsed command arguments
 */
export interface ParsedArgs {
    [key: string]: any,
}

// ================================ //
//             Utility              //
// ================================ //

interface splitData {
    text: string,
    start: number,
    end: number,
    quoted: boolean,
}
// utility function to split commands into parts
function splitCommand(cmd: string, startIndex?: number): splitData[] {
    const result: splitData[] = [];
    
    let text: string;
    let escapeChar = false;
    
    let i: number;
    let start: number;
    let isQuoted = false;
    
    const addVec = () => {
        if (!text || !text.length)
            return;
        result.push({
            text,
            start: start + (isQuoted ? -1 : 0),
            end: i + (isQuoted ? 1 : 0),
            quoted: isQuoted,
        });
        text = null;
        start = null;
    }
    
    // extract parts by characters
    for (i = startIndex || 0; i < cmd.length; i++) {
        if (!text) {
            start = i;
            text = "";
        }
        
        const char = cmd[i];
        
        // char is escaped
        if (escapeChar) {
            escapeChar = false;
            text += char;
            continue;
        }
        
        // backslash found
        if (char == "\\") {
            escapeChar = true;
            continue;
        }
        
        // double quote found
        if (char == "\"") {
            addVec();
            isQuoted = !isQuoted;
            continue;
        }
        
        // whitespace
        if (!isQuoted && /\s/.test(char)) {
            addVec();
            continue;
        }
        
        text += char;
    }
    
    if (text && text.length) addVec();
    
    return result;
}
