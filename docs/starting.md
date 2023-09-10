# Getting Started

Welcome to the Bedrock Custom Command Handler documentation! This guide will help
you get started quickly and unleash the full potential of custom commands in your
Minecraft addon.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Using the Command Handler](#using-the-command-handler)
- [API Documentation](#api-documentation)

## Prerequisites

Before you dive in, here are some prerequisites:

- Basic understanding of TypeScript or JavaScript.
- Familiarity with Minecraft Bedrock Edition and addon development.

## Installation

First, ensure you have the Bedrock Custom Command Handler installed. To do this,
follow the installation instructions in the [Installation Guide](install.md),
which provides detailed steps based on your preferred programming language.

## Using the Command Handler

Now that you've successfully installed the Bedrock Custom Command Handler, you
can begin creating and managing custom commands in your Minecraft addon. Here
are some examples of usage:

```javascript
import { CommandRegistry } from "./path/to/command/handler.js";

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
    // get the value of argument, "no text" by default
    const arg = ctx.args["val"];
    // feedback message to command user
    ctx.sender?.sendMessage(arg);
    // return the text back if the command is called within the script
    return arg;
});

// Try type '\echo hi' in chats!
```

Make sure to replace `"./path/to/command/handler.js"` to where you put the handler
on the installation.

For in-depth information on using the command handler, creating custom commands,
and enhancing your Minecraft experience, refer to the API Documentation:

## API Documentation

To explore the Bedrock Custom Command Handler API and access detailed usage
information, head to the [API Documentation](api/index.md) section. Here, you'll
find comprehensive guides, examples, and reference material to help you make the
most of the command handler's capabilities.

With the power of custom commands at your fingertips, your Minecraft addon can
provide unique gameplay experiences tailored to your vision.
