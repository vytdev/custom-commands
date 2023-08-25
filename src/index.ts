// import the module
import { CommandRegistry } from "./commands.js";

// create handler for '\' prefix
const handler = new CommandRegistry("\\");

// register new command
handler.register({
    name: "echo",                  // name of the command
    aliases: [ "&" ],              // command aliases
    dest: "",                      // (this would always true)
    args: [
        {
            dest: "val",           // destination of the value of argument
            name: "text",          // text to show in help for this arg
            type: "string",        // type of the parameter
            required: false,       // parameter is not required
            default: "no text",    // default value for the arg
        }
    ],
}, (ctx) => {
    // feedback message to command initiator
    ctx.sender?.sendMessage(ctx.args.val);
    // return the text back if the command is called within the script
    return ctx.args.val;
});

// Try type '\echo hi' in chats!
