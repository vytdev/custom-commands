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
 * Command callback
 * @param ctx The execution context
 */
export type CommandCallback = (ctx: CommandContext) => void;

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

// ================================ //
//            Builders              //
// ================================ //

/**
 * Command argument definition
 */
export class CommandArgument {
    /**
     * Creates new argument instance
     * @param name
     * @param type
     * @param [id]
     */
    constructor(name: string, type: string | CommandTypeParser, id?: string) {
        this.name = name;
        this.type = type;
        this.dest = id ?? name;
    }
    /**
     * Name of the argument displayed on the help
     */
    public name: string;
    /**
     * Type of the argument
     */
    public type: string | CommandTypeParser;
    /**
     * Where to place the argument value when parsed
     */
    public dest: string;
    /**
     * Help message
     */
    public help: string;
    /**
     * Whether this argument is required
     */
    public required: boolean;
    /**
     * Default value for the argument
     */
    public default: any;
    /**
     * Set help message
     * @param msg
     * @returns {this}
     */
    public setHelp(msg: string): this {
        this.help = msg;
        return this;
    }
    /**
     * Set required
     * @param val
     * @returns {this}
     */
    public setRequired(val: boolean): this {
        this.required = !!val;
        return this;
    }
    /**
     * Set default value
     * @param val
     * @returns {this}
     */
    public setDefault(val: any): this {
        this.default = val;
        return this;
    }
    /**
     * Other attributes
     * @param key
     * @param val
     * @returns {this}
     */
    public setAttr(key: string, val: any): this {
        this[key] = val;
        return this;
    }
    /**
     * Allow custom attributes
     */
    [key: string]: any;
}

/**
 * Command flag definition
 */
export class CommandFlag {
    /**
     * Create a new flag definition instance
     */
    constructor(long: string, short?: string, id?: string) {
        this.long = long;
        this.short = short;
        this.dest = id;
    }
    /**
     * The place of this flag on the object when parsed
     */
    public dest: string;
    /**
     * Long flag
     */
    public long: string;
    /**
     * Short flag
     */
    public short: string;
    /**
     * Arguments within the flag
     */
    public args: CommandArgument[] = [];
    /**
     * Add argument on the flag
     * @param name
     * @param type
     * @param [id]
     * @param [build]
     */
    public addArgument(name: string, type: string | CommandTypeParser, id?: string, build?: (arg: CommandArgument) => void): this {
        const arg = new CommandArgument(name, type, id);
        build(arg);
        this.args.push(arg);
        return this;
    }
}

/**
 * Command builder
 */
export class CommandBuilder {
    /**
     * Create a new command builder
     * @param name
     * @param [id]
     */
    constructor(name: string, id?: string) {
        this.name = name;
        this.dest = id ?? name;
    }
    /**
     * Name of the sub-command to use when invoking or in help
     */
    public name: string;
    /**
     * Where to place the argument value when parsed
     */
    public dest: string;
    /**
     * Aliases for the command/sub-command
     */
    public aliases: string[] = [];
    /**
     * Positional arguments definition
     */
    public args: CommandArgument[] = [];
    /**
     * Flags definition
     */
    public flags: CommandFlag[] = [];
    /**
     * Sub-commands definition
     */
    public subcommands: CommandBuilder[] = [];
    /**
     * Add an alias for this command/sub-command
     */
    public addAlias(...alias: string[]): this {
        this.aliases.push(...alias);
        return this;
    }
    /**
     * Add argument on this command/sub-command
     * @param name
     * @param type
     * @param [id]
     * @param [build]
     */
    public addArgument(name: string, type: string | CommandTypeParser, id?: string, build?: (arg: CommandArgument) => void): this {
        const arg = new CommandArgument(name, type, id);
        build(arg);
        this.args.push(arg);
        return this;
    }
    /**
     * Add flag on this command/sub-command
     * @param long
     * @param [short]
     * @param [id]
     * @param [build]
     */
    public addFlag(long: string, short: string, id?: string, build?: (flag: CommandFlag) => void): this {
        const flag = new CommandFlag(long, short, id);
        build(flag);
        this.flags.push(flag);
        return this;
    }
    /**
     * Add a sub-command on this command/sub-command
     * @param name
     * @param [id]
     * @param [build]
     */
    public addSubCommand(name: string, id?: string, build?: (cmd: CommandBuilder) => void): this {
        const cmd = new CommandBuilder(name, id);
        build(cmd);
        this.subcommands.push(cmd);
        return this;
    }
}

// ================================ //
//             Classes              //
// ================================ //

/**
 * Command context
 */
export class CommandContext {
    /**
     * Create a command execution context instance
     */
    constructor(args: ParsedArgs) {
        this.args = args;
    }
    /**
     * Parsed args
     */
    public readonly args: ParsedArgs;
}
