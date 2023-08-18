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
export type CommandTypeParser = (argv: CommandToken[], argDef: CommandArgument) => {
    /**
     * The argument as parsed
     */
    value: any,
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
 * Command argument definition
 */
export interface CommandArgumentType {
    /**
     * Name of the argument displayed on the help
     */
    name?: string;
    /**
     * Type of the argument
     */
    type: string | CommandTypeParser;
    /**
     * Where to place the argument value when parsed
     */
    dest: string;
    /**
     * Help message
     */
    help?: string;
    /**
     * Whether this argument is required
     */
    required?: boolean;
    /**
     * Default value for the argument
     */
    default?: any;
    /**
     * Allow custom attributes
     */
    [key: string]: any;
}

/**
 * Command flag definition
 */
export interface CommandFlagType {
    /**
     * The place of this flag on the object when parsed
     */
    dest: string;
    /**
     * Long flag
     */
    long?: string;
    /**
     * Short flag
     */
    short?: string;
    /**
     * Help message
     */
    help?: string;
    /**
     * Arguments within the flag
     */
    args?: CommandArgumentType[];
}

/**
 * Command builder type
 */
export interface CommandBuilderType {
    /**
     * Name of the sub-command to use when invoking or in help
     */
    name: string;
    /**
     * Where to place the argument value when parsed
     */
    dest: string;
    /**
     * Aliases for the command/sub-command
     */
    aliases?: string[];
    /**
     * Help message
     */
    help?: string;
    /**
     * Positional arguments definition
     */
    args?: CommandArgumentType[];
    /**
     * Flags definition
     */
    flags?: CommandFlagType[];
    /**
     * Sub-commands definition
     */
    subcommands?: CommandBuilderType[];
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

const argTypes: { [name: string]: CommandTypeParser } = {};
/**
 * Function to register custom argument types
 */
export function registerArgumentType(typeName: string, parser: CommandTypeParser): void {
    argTypes[typeName] = parser;
}

/**
 * Command token structure
 */
export interface CommandToken {
    /**
     * The parameter
     */
    text: string,
    /**
     * Start index of the param on the command
     */
    start: number,
    /**
     * End index of the param on the command
     */
    end: number,
    /**
     * Whether the param is quoted
     */
    quoted: boolean,
}
/**
 * Utility function to split the command into tokens
 * @param cmd The command string to tokenize
 * @param [startIndex] Optional start index, useful when skipping prefix
 * @returns Array of command tokens
 */
export function tokenizeCommand(cmd: string, startIndex?: number): CommandToken[] {
    const result: CommandToken[] = [];
    
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
export class CommandArgument implements CommandArgumentType {
    /**
     * Create a command argument instance from an object
     * @param obj The argument definition
     * @returns {CommandArgument}
     */
    public static from(obj: CommandArgumentType): CommandArgument {
        const cls = new CommandArgument(obj.name, obj.type, obj.dest);
        if ("help" in obj) cls.help = obj.help;
        if ("required" in obj) cls.required = obj.required;
        if ("default" in obj) cls.default = obj.default;
        return cls;
    }
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
    public required: boolean = true;
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
     * Create a command flag instance from an object
     * @param obj The flag definition
     * @returns {CommandFlag}
     */
    public static from(obj: CommandFlagType): CommandFlag {
        const cls = new CommandFlag(obj.long, obj.short, obj.dest);
        if ("args" in obj) {
            for (const argDef of obj.args) {
                cls.args.push(CommandArgument.from(argDef));
            }
        }
        return cls;
    }
    /**
     * Create a new flag definition instance
     */
    constructor(long: string, short?: string, id?: string) {
        this.long = long;
        this.short = short;
        this.dest = id || long;
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
     * Help message
     */
    public help: string;
    /**
     * Arguments within the flag
     */
    public args: CommandArgument[] = [];
    /**
     * Set help message
     * @returns {this}
     */
    public setHelp(msg: string): this {
        this.help = msg;
        return this;
    }
    /**
     * Add argument on the flag
     * @param name
     * @param type
     * @param [id]
     * @param [build]
     * @returns {this}
     */
    public addArgument(name: string, type: string | CommandTypeParser, id?: string, build?: (arg: CommandArgument) => void): this {
        const arg = new CommandArgument(name, type, id);
        build?.(arg);
        this.args.push(arg);
        return this;
    }
}

/**
 * Command builder
 */
export class CommandBuilder {
    /**
     * Create a command builder instance from an object
     * @param obj The builder definition
     * @returns {CommandBuilder}
     */
    public static from(obj: CommandBuilderType): CommandBuilder {
        const cls = new CommandBuilder(obj.name, obj.dest);
        if ("aliases" in obj) cls.aliases = obj.aliases;
        if ("help" in obj) cls.help = obj.help;
        if ("args" in obj) {
            for (const argDef of obj.args) {
                cls.args.push(CommandArgument.from(argDef));
            }
        }
        if ("flags" in obj) {
            for (const flagDef of obj.flags) {
                cls.flags.push(CommandFlag.from(flagDef));
            }
        }
        if ("subcommands" in obj) {
            for (const subDef of obj.subcommands) {
                cls.subcommands.push(CommandBuilder.from(subDef));
            }
        }
        return cls;
    }
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
     * Help message
     */
    public help: string;
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
     * @param alias[] The aliases to add
     * @returns {this}
     */
    public addAlias(...alias: string[]): this {
        this.aliases.push(...alias);
        return this;
    }
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
     * Add argument on this command/sub-command
     * @param name
     * @param type
     * @param [id]
     * @param [build]
     * @returns {this}
     */
    public addArgument(name: string, type: string | CommandTypeParser, id?: string, build?: (arg: CommandArgument) => void): this {
        const arg = new CommandArgument(name, type, id);
        build?.(arg);
        this.args.push(arg);
        return this;
    }
    /**
     * Add flag on this command/sub-command
     * @param long
     * @param [short]
     * @param [id]
     * @param [build]
     * @returns {this}
     */
    public addFlag(long: string, short?: string, id?: string, build?: (flag: CommandFlag) => void): this {
        const flag = new CommandFlag(long, short, id);
        build?.(flag);
        this.flags.push(flag);
        return this;
    }
    /**
     * Add a sub-command on this command/sub-command
     * @param name
     * @param [id]
     * @param [build]
     * @returns {this}
     */
    public addSubCommand(name: string, id?: string, build?: (cmd: CommandBuilder) => void): this {
        const cmd = new CommandBuilder(name, id);
        build?.(cmd);
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

/**
 * Command error, when parsing or on execution
 */
export class CommandError extends Error {
    /**
     * Create a new command error instance
     * @param msg Message to show
     * @param [start] Offset of the syntax error on start
     * @param [end] Offset of the syntax error on end
     */
    constructor(msg: string, start?: number, end?: number) {
        super(msg);
        this.message = msg;
        this.start = start || 0;
        this.end = end || 0;
        this.name = "CommandError";
    }
    /**
     * Error message
     */
    public readonly message: string;
    /**
     * The token where this error was thrown
     */
    public token: CommandToken;
    /**
     * The command that was called
     */
    public command: string;
    /**
     * Start index offset of token if this is a syntax error
     */
    public start: number = 0;
    /**
     * End index offset of token if this is a syntax error
     */
    public end: number = 0;
    /**
     * Whether it is syntax error
     */
    public get syntax(): boolean {
        return !!this.token;
    }
    /**
     * Get the syntax error stack
     * @param offset Optional offset length of string to show in start and end
     * of the error origin
     * @returns {string} The traced stack in the command
     */
    public getStack(offset: number = 10): string {
        // not a syntax error
        if (!this.token) return "";
        
        // process stack trace
        let start = this.token.start + this.start;
        let end = this.token.end - this.end;
        
        return this.command.slice(Math.max(0, start - offset), start) +
               ">>" + this.command.slice(start, end) + "<<" +
               this.command.slice(end, Math.min(end + offset, this.command.length));
    }
    /**
     * Return string representation of the error
     */
    public toString(): string {
        let msg = this.message;
        // a syntax error
        if (this.syntax) {
            msg += "\n    at column ";
            msg += this.token.start + this.start + 1;
            msg += "\n    ";
            msg += this.getStack();
        }
        return msg;
    }
}

/**
 * Command instance
 */
export class Command {
    /**
     * Create a command
     * @param info The command register information
     * @param fn Callback to be executed when the command is called
     */
    constructor(info: CommandBuilder, fn: CommandCallback) {
        this.info = info;
        this.fn = fn;
    }
    /**
     * Command information
     */
    public readonly info: CommandBuilder;
    /**
     * Command callback
     */
    public readonly fn: CommandCallback;
    /**
     * Enable parsing of flags in this command
     */
    public parseFlags: boolean = true;
    /**
     * Allow double-dash delimeters to disable subsequent options in a command
     */
    public breakableFlags: boolean = true;
    /**
     * Whether to use Java-like parsing for long flags, like: -longFlagName
     */
    public javaFlags: boolean = false;
    /**
     * Allow equals to parse arg in short flags, like: -abcd=argOfFlagD
     */
    public equalsInShortFlags: boolean = true;
    /**
     * Parse the given string with this command
     * @param cmd
     * @returns {ParsedArgs}
     */
    public parse(cmd: string): ParsedArgs {
        const result: ParsedArgs = {};
        const argv: CommandToken[] = tokenizeCommand(cmd);
        let useFlags: boolean = this.parseFlags;
        
        // function to parse args
        const processArg = (idx: number, argDef: CommandArgument, result: ParsedArgs): number => {
            const typeParser = typeof argDef.type == "function" ? argDef.type : argTypes[argDef.type];
            
            // unknown type parser
            if (typeof typeParser != "function") {
                const err = new CommandError("Internal error: Type parser of argument is not callable");
                err.token = argv[idx];
                err.command = cmd;
                throw err;
            }
            
            let parsed;
            try {
                parsed = typeParser(argv.slice(idx), argDef);
            } catch (e) {
                // unknown error
                if (!(e instanceof CommandError)) {
                    const err = new CommandError("Internal error: Exception encountered with trace stack:\n" + e.stack);
                    err.command = cmd;
                    throw err;
                }
                e.command = cmd;
                throw e;
            }
            
            result[argDef.dest] = parsed.value;
            return idx + (parsed.step || 1);
        };
        
        // function to process command/sub-commands
        const processCmd = (idx: number, cmdDef: CommandBuilder, result: ParsedArgs): number => {
            // argument index in this command
            let argIdx: number = 0;
            
            for ( ; idx < argv.length; idx++) {
                const arg: CommandToken = argv[idx];
                
                // posible flag
                if (useFlags && !arg.quoted && arg.text[0] == "-") {
                    let isShort = arg.text[1] != "-";
                    // break flags
                    if (this.breakableFlags && !isShort && arg.text.length == 2) {
                        useFlags = false;
                        continue;
                    }
                    
                    const chars = arg.text.slice(!isShort ? 2 : 1);
                    const flagName = chars.split("=")[0];
                    const equalArg = chars.slice(flagName.length + 1);
                    // attempt to find a long flag
                    const longFlag: CommandFlag = cmdDef.flags.find(v => v.long == flagName);
                    
                    // this is a long flag, but the flag not exists
                    if (!isShort && !longFlag) {
                        const err = new CommandError("Unrecognized flag: " + flagName, 2);
                        err.token = arg;
                        err.command = cmd;
                        throw err;
                    }
                    
                    // long flag found, but the arg only haves one dash
                    if (this.javaFlags && longFlag) isShort = false;
                    
                    // current flag to process
                    let currentFlag: CommandFlag = longFlag;
                    
                    // process short flags
                    if (isShort) {
                        let flagIdx = 0;
                        for (const f of chars) {
                            // for: -abcd=argOfFlagD
                            if (this.equalsInShortFlags && currentFlag?.args.length && f == "=") {
                                break;
                            }
                            // next flag
                            flagIdx++;
                            currentFlag = cmdDef.flags.find(v => v.short && v.short[0] == f);
                            // unknown flag
                            if (!currentFlag) {
                                const err = new CommandError("Unknown option: " + f, flagIdx, arg.text.length - flagIdx - 1);
                                err.command = cmd;
                                err.token = arg;
                                throw err;
                            }
                            result[currentFlag.dest] = true;
                        }
                    }
                    
                    // possible equals found
                    if (chars != flagName) {
                        // flag is like this: --flagName="arg"
                        const useNextArg = !equalArg.length;
                        
                        // equal arg was found
                        if (!currentFlag.args.length && longFlag) {
                            const err = new CommandError("Option '--" + flagName + "' doesn't allow an argument", 3 + flagName.length);
                            err.token = arg;
                            err.command = cmd;
                            // flag arg is empty
                            if (useNextArg) {
                                const nextArg = argv[idx + 1];
                                err.token = nextArg;
                                err.start = 0;
                            }
                            throw err;
                        }
                        
                        arg.end -= equalArg.length + 2;
                        
                        if (!useNextArg) {
                            argv.splice(idx + 1, 0, {
                                start: arg.start + flagName.length + 2,
                                end: arg.end + chars.length,
                                text: equalArg,
                                quoted: false,
                            });
                        }
                    }
                    
                    // current flag has arguments
                    if (currentFlag.args.length) {
                        let flagArgIdx: number = 0;
                        let processFlagArgs: boolean = true;
                        let err: CommandError;
                        
                        // process args
                        for ( ; flagArgIdx < currentFlag.args.length; flagArgIdx++) {
                            const argDef = currentFlag.args[flagArgIdx];
                            if (processFlagArgs) {
                                try {
                                    idx = processArg(idx + 1, argDef, result) - 1;
                                    continue;
                                } catch (e) {
                                    err = e;
                                    
                                    // more args
                                    if (argv.length <= idx + 1) {
                                        err = new CommandError("Flag requires more argument");
                                        err.token = {
                                            text: "",
                                            start: cmd.length,
                                            end: cmd.length,
                                            quoted: false,
                                        };
                                        err.command = cmd;
                                    }
                                    
                                    processFlagArgs = false;
                                }
                            }
                            
                            // arg is required, or equal arg is found
                            if (argDef.required || (flagArgIdx == 0 && chars != flagName)) throw err;
                            // default args
                            result[argDef.dest] = argDef.default;
                        }
                    }
                    
                    // for long flags
                    result[currentFlag.dest] = true;
                    
                    continue;
                }
                
                // process args
                const argDef = cmdDef.args[argIdx++];
                
                // no arg left
                if (!argDef) {
                    // no sub commands
                    if (!cmdDef.subcommands.length) {
                        const err = new CommandError("Too many arguments", 0, -cmd.length);
                        err.command = cmd;
                        err.token = arg;
                        throw err;
                    }
                    
                    // process sub-commands
                    const unNamedSubs: CommandBuilder[] = [];
                    let done: boolean = false;
                    
                    for (const subDef of cmdDef.subcommands) {
                        if (!subDef.name?.length) {
                            unNamedSubs.push(subDef);
                            continue;
                        }
                        
                        // sub-command found with that name or alias
                        if (subDef.name == arg.text || subDef.aliases.includes(arg.text)) {
                            idx = processCmd(idx + 1, subDef, result);
                            done = true;
                            break;
                        }
                    }
                    
                    // sub-command done
                    if (done) break;
                    
                    // no sub-command was found with that name
                    if (!unNamedSubs.length) {
                        const err = new CommandError("Unknown sub-command: " + arg.text);
                        err.token = arg;
                        err.command = cmd;
                        throw err;
                    }
                    
                    let err;
                    
                    for (const subDef of unNamedSubs) {
                        const subResult: ParsedArgs = {};
                        
                        try {
                            idx = processCmd(idx, subDef, subResult);
                        } catch (e) {
                            if (!err) err = e;
                            continue;
                        }
                        
                        done = true;
                        for (const k in subResult) result[k] = subResult[k];
                        break;
                    }
                    
                    if (!done) throw err;
                    
                    break;
                }
                
                // parse argument
                idx = processArg(idx, argDef, result) - 1;
            }
            
            // left not processed args
            for ( ; argIdx < cmdDef.args.length; argIdx++) {
                const argDef = cmdDef.args[argIdx];
                if (argDef.required) {
                    const err = new CommandError("Unexpected end of input");
                    err.token = {
                        text: "",
                        start: cmd.length,
                        end: cmd.length,
                        quoted: false,
                    };
                    err.command = cmd;
                    throw err;
                }
                
                result[argDef.dest] = argDef.default;
            }
            
            // command/sub-command processed successfully
            result[cmdDef.dest] = true;
            
            return idx;
        }
        
        // process command
        processCmd(0, this.info, result);
        
        return result;
    }
}
