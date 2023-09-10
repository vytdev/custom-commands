# Command (`Command`)

The `Command` class represents a custom command that can be executed within the
Minecraft server. This class provides essential properties and methods to define
and manage custom commands, allowing you to create unique gameplay experiences.
Below, you'll find detailed information about the `Command` class, including its
constructor, instance properties, and methods.

If you're ready to explore the capabilities of the `Command` class and start
crafting custom commands for your Minecraft server, dive into the documentation
below.

**Constructor:**

`Command(info: ` [`CommandBuilder`](./CommandBuilder.md)`, fn: ` [`CommandCallback`](./CommandCallback.md)`)`

An instance of the `Command` class represents a custom command that can be executed
within the Minecraft server. It encapsulates information about the command and the
callback function to execute when the command is invoked.

- `info` (type: [`CommandBuilder`](./CommandBuilder.md)):

  Information about the command, including its name, description, and other
  properties.

- `fn` (type: [`CommandCallback`](./CommandCallback.md)):

  The callback function to execute when the command is invoked. This function
  defines the behavior of the command.

**Instance Properties:**

- `info` (type: [`CommandBuilder`](./CommandBuilder.md), readonly)

  Information about the command, including its name, description, and other
  properties.

- `fn` (type: [`CommandCallback`](./CommandCallback.md), readonly)

  The callback function to execute when the command is invoked. This function
  defines the behavior of the command.

- `parseFlags` (type: `boolean`)

  A boolean indicating whether flags should be parsed in this command. If `true`,
  the command will process flags and their arguments.

- `breakableFlags` (type: `boolean`)

  A boolean indicating whether double-dash delimiters should disable subsequent
  options in a command. When set to `true`, using `--` will indicate the end of
  flags.

- `javaFlags` (type: `boolean`)

  A boolean indicating whether Java-like parsing for long flags (e.g., -longFlagName)
  should be used. When set to `true`, long flags can be parsed with a single dash.

- `equalsInShortFlags` (type: `boolean`)

  A boolean indicating whether equals signs should be used to parse arguments in
  short flags (e.g., `-abcd=argOfFlagD`). When set to `true`, equals signs are
  treated as argument separators in short flags.

**Instance Methods:**

- `parse(cmd: string, prefixLength?: number)`

  Parses the given string with this command.

  - `cmd` (type: `string`):

    The command string to parse.

  - `prefixLength` (type: `number`, optional):

    The starting position for parsing within the string.

  **Returns:** [`ParsedArgs`](./ParsedArgs.md)

- `call(cmd: string)`

  Invokes the command with the given arguments.

  - `cmd` (type: `string`):

    The arguments to pass to the command.

  **Returns:** `any`

This documentation provides a comprehensive overview of the `Command` class, its
properties, and methods. With this knowledge, you can create and manage custom
commands to enhance your Minecraft server's gameplay.
