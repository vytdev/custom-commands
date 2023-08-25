# `CommandArgument`

This class handles a command argument parsing information object, and implements
the [`CommandArgumentType`][type] interface. Usage:

```typescript
import { CommandArgument } from "commands.js";

const arg = new CommandArgument("example", "string", "id")
    .setHelp("Help message")    // text to show in help for this arg
    .setRequired(true)          // set required, default: true
    .setDefault(null);          // set default value when arg is not specified
```

### Constructor

`new CommandArgument()`

Create a new `CommandArgument` instance, you can use it to handle your command
arguments dynamically. This takes two to three parameters:

1. `name`, name of the argument to show in help.
2. `type`, parsing strategy for the argument. Can be a [function](./CommandTypeParser.md)
   or a [string](./registerArgumentType.md).
3. `id` (optional), destination of the argument value on the [parsed object](./ParsedArgs.md).

### Static methods

`CommandArgument.from()`

Create a `CommandArgument` instance from a raw [`CommandArgumentType`][type] object,
like as follows:

```typescript
import { CommandArgument, CommandArgumentType } from "commands.js";

// raw command arg object
const argObject: CommandArgumentType = {
    name: "example",
    type: "string",
    dest: "id",
    help: "Help message",
    required: true,
    default: null,
};

// actual usage
const arg = CommandArgument.from(argObject);
```

### Instance methods

`CommandArgument.prototype.setHelp()`

Set help message and return the argument instance itself. This takes one parameter
`msg`, the help string to set.

`CommandArgument.prototype.setRequired()`

Set the value for `required` property in the class, then return `this`.

`CommandArgument.prototype.setDefault()`

Set default value for the argument when the arg is not specified in a command and
are not required. Takes one parameter `val` to set its value.

`CommandArgument.prototype.setAttr()`

Set additional attributes to the class itself. Useful when passing values to type
parsers. Takes two parameters `key` and `val`, `key` for the entry of the attribute
in the class and `val` is for the value to set.

### Instance properties

`CommandArgument.prototype.name`

The name of the argument in help.

`CommandArgument.prototype.type`

Type parsing strategy of the argument, set from the constructor.

`CommandArgument.prototype.dest`

Destination of this argument value to the [parsed object](./ParsedArgs.md).

`CommandArgument.prototype.help`

Help message to show in help.

`CommandArgument.prototype.required`

Whether this argument is required. `true` by default.

`CommandArgument.prototype.default`

Default value for the argument when not given in the command and also if it isn't
required.

`CommandArgument.prototype[ ... ]`

Additional attributes for the argument you can pass to type parsers.

[type]: ./CommandArgumentType.md
