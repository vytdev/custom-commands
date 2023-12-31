/*!
 * Custom commands handler for Minecraft Bedrock
 * 
 * Version: 0.1.0
 * Author: VYT
 * Source code: https://github.com/vytdev/custom-commands
 * Documentation: https://github.com/vytdev/custom-commands/blob/master/docs/index.md
 */

// import this required module
import { world, ChatSendBeforeEvent, Player } from "@minecraft/server";

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

/**
 * Cache raw command components
 */
const cachedComponents:
    Map<CommandArgumentType, CommandArgument> &
    Map<CommandFlagType, CommandFlag> &
    Map<CommandBuilderType, CommandBuilder> = new Map();
/**
 * Registered argument types
 */
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
//           Type parsers           //
// ================================ //

// string type
registerArgumentType("string", (argv, def) => {
    return { value: argv[0].text };
});
// boolean type
registerArgumentType("boolean", (argv, def) => {
    const token = argv[0];
    
    if (!/^(true|false)$/.test(token.text)) {
        const err = new CommandError("Type error: '" + token.text + "' is not a true or false");
        err.token = token;
        throw err;
    }
    
    return {
        value: token.text == "true" ? true : false
    }
});
// number type
registerArgumentType("number", (argv, def) => {
    const token = argv[0];
    const arg = token.text;
    
    if (!/^[-+]?(0|[1-9]\d*)(\.\d+)?$/.test(arg)) {
        const err = new CommandError("Type error: '" + arg + "' is not a valid number");
        err.token = token;
        throw err;
    }
    
    const num = parseFloat(arg);
    
    // check ranges
    if (def.range) {
        // check min
        if (typeof def.range?.[0] == "number") {
            if (num < def.range[0]) {
                const err = new CommandError("Type error: " + arg + " is to small, it must be atleast " + def.range[0]);
                err.token = token;
                throw err;
            }
        }
        // check max
        if (typeof def.range?.[1] == "number") {
            if (num > def.range[1]) {
                const err = new CommandError("Type error: " + arg + " is to big, it must be atmost " + def.range[1]);
                err.token = token;
                throw err;
            }
        }
    }
    
    return { value: num };
});
// typed numbers type
["byte", "short", "int", "long"].forEach((name, idx) => {
    // ranges
    const point = 8 << idx;
    const minSigned = -(2 ** (point - 1))
    const minUnsigned = 0;
    const maxSigned = 2 ** (point - 1) - 1;
    const maxUnsigned = 2 ** point - 1;
    
    registerArgumentType(name, (argv, def) => {
        const token = argv[0];
        const arg = token.text;
        
        if (!/^[-+]?(0|[1-9]\d*)$/.test(arg)) {
            const err = new CommandError("Type error: '" + arg + "' is not a valid " + name);
            err.token = token;
            throw err;
        }
        
        const num = parseInt(arg);
        
        if (
            (num < (def.unsigned ? minUnsigned : minSigned)) || // min
            (num > (def.unsigned ? maxUnsigned : maxSigned))    // max
        ) {
            const err = new CommandError((2 ** idx * 8) + "-bit " + (def.unsigned ? "unsigned" : "signed") + " overflow");
            err.token = token;
            throw err;
        }
        
        return { value: num };
    });
});
// float num type
registerArgumentType("float", (argv, def) => {
    const token = argv[0];
    const arg = token.text;
    
    if (!/^[-+]?(0|[1-9]\d*)\.\d+$/.test(arg)) {
        const err = new CommandError("Type error: '" + arg + "' is not a valid float");
        err.token = token;
        throw err;
    }
    
    return { value: parseFloat(arg) };
});
// double num type
registerArgumentType("double", (argv, def) => {
    const token = argv[0];
    const arg = token.text;
    
    if (!/^[-+]?(0|[1-9]\d*)\.\d{2,}$/.test(arg)) {
        const err = new CommandError("Type error: '" + arg + "' is not a valid double");
        err.token = token;
        throw err;
    }
    
    return { value: parseFloat(arg) };
});

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
        if (cachedComponents.has(obj)) return cachedComponents.get(obj);
        const cls = new CommandArgument(obj.name, obj.type, obj.dest);
        cachedComponents.set(obj, cls);
        
        for (const k in obj) cls[k] = obj[k];
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
export class CommandFlag implements CommandFlagType {
    /**
     * Create a command flag instance from an object
     * @param obj The flag definition
     * @returns {CommandFlag}
     */
    public static from(obj: CommandFlagType): CommandFlag {
        if (cachedComponents.has(obj)) return cachedComponents.get(obj);
        const cls = new CommandFlag(obj.long, obj.short, obj.dest);
        cachedComponents.set(obj, cls);
        
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
export class CommandBuilder implements CommandBuilderType {
    /**
     * Create a command builder instance from an object
     * @param obj The builder definition
     * @returns {CommandBuilder}
     */
    public static from(obj: CommandBuilderType): CommandBuilder {
        if (cachedComponents.has(obj)) return cachedComponents.get(obj);
        const cls = new CommandBuilder(obj.name, obj.dest);
        cachedComponents.set(obj, cls);
        
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
     * @param cmd
     * @param args
     * @param [data]
     */
    constructor(cmd: string, args: ParsedArgs, data?: ChatSendBeforeEvent) {
        this.command = cmd;
        this.args = args;
        this.sender = data?.sender;
    }
    /**
     * The command text
     */
    public readonly command: string;
    /**
     * Parsed args
     */
    public readonly args: ParsedArgs;
    /**
     * The player who executes the command, can be undefined
     */
    public readonly sender: Player;
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
     * @param cmd The command to parse
     * @param [prefixLength] Where to start parsing the command in the string
     * @returns {ParsedArgs}
     */
    public parse(cmd: string, prefixLength?: number): ParsedArgs {
        const result: ParsedArgs = {};
        const argv: CommandToken[] = tokenizeCommand(cmd, prefixLength);
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
    /**
     * Calls the command with given arguments
     * @param cmd The arguments to pass
     * @returns {any} Return value of the command
     */
    public call(cmd: string): any {
        const ctx = new CommandContext(cmd, this.parse(cmd));
        return this.fn(ctx);
    }
}

/**
 * Command registry handler class
 */
export class CommandRegistry {
    /**
     * Create a new registry
     * @param [prefix] Prefix to use in chat messages, this registry and the
     * contained commands wont be available on chats if this parameter not given.
     */
    constructor(prefix?: string) {
        if (typeof prefix == "string")
            this.startService(prefix);
    }
    /**
     * @private
     */
    private _cmds: Command[] = [];
    private _listener: (arg: ChatSendBeforeEvent) => void;
    /**
     * The current prefix
     */
    public prefix: string = null;
    /**
     * Start command service on chats
     * @param prefix Prefix to use
     */
    public startService(prefix: string): void {
        this.prefix = prefix;
        this._listener = world.beforeEvents.chatSend.subscribe(ev => {
            // not starts with our prefix
            if (!ev.message.startsWith(prefix)) return;
            
            // cancel this message from being broadcasted
            ev.cancel = true;
            
            const msg = ev.message.slice(prefix.length);
            // the name of the command
            const cmdName = msg.trim().split(/\s+/, 1)[0];
            // command class
            const cmdData = this.getCommand(cmdName, true);
            
            if (!cmdData)
                return ev.sender.sendMessage("§cUnknown command: " + cmdName + ". Please check that the command exists and you have permission to use it.");
            
            // where to start parsing
            const startPos = prefix.length + cmdName.length + msg.match(/^\s*/)[0].length;
            
            try {
                // attempt to call the command
                const ctx = new CommandContext(ev.message, cmdData.parse(ev.message, startPos), ev);
                cmdData.fn(ctx);
            }
            catch (e) {
                // handle exceptions
                if (e instanceof CommandError) {
                    ev.sender.sendMessage("§c" + e.toString());
                }
                // unknown error
                else {
                    ev.sender.sendMessage("§cInternal error");
                    ev.sender.sendMessage("§c" + (e?.stack ? e.stack : e));
                }
            }
        });
    }
    /**
     * Stop command service on chats if active
     * @returns {boolean} True if the service are active and stopped, false
     * otherwise
     */
    public stopService(): boolean {
        if (!this._listener) return false;
        world.beforeEvents.chatSend.unsubscribe(this._listener);
        this._listener = null;
        return true;
    }
    /**
     * Search for a command in the registry
     * @param cmd The command name, or alias
     * @param [alias] Whether to search also for alias
     * @returns {Command} The command class
     */
    public getCommand(cmd: string, alias?: boolean): Command {
        return this._cmds.find(v => v.info.name == cmd || (alias && v.info.aliases?.includes(cmd)));
    }
    /**
     * Register a new command to this registry
     * @param info {@link CommandBuilder} instance or a {@link CommandBuilderType}
     * object that represents the command information
     * @param callback Callable to execute when the command was called
     * @returns {Command} Created Command class
     */
    public register(info: CommandBuilder | CommandBuilderType, callback: CommandCallback): Command {
        if (!(info instanceof CommandBuilder)) info = CommandBuilder.from(info);
        const cmd = new Command(info as CommandBuilder, callback);
        this._cmds.push(cmd);
        return cmd;
    }
}
