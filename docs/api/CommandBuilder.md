# Command Builder (`CommandBuilder`)

The `CommandBuilder` class is a crucial component for defining and managing
commands and sub-commands in the Minecraft server. It offers extensive
customization options, enabling you to create versatile command structures.

**Constructor:**

`CommandBuilder(name: string, id?: string)`

Creates a new instance of the `CommandBuilder` class, representing a sub-command.

- `name` (Type: `string`):

  The name of the sub-command used when invoking or displayed in help messages.

- `id` (Type: `string`, optional):

  An optional identifier used to specify where the parsed command or sub-command value is placed. If not provided, it defaults to the sub-command's name.

**Static Method:**

- `from(obj: ` [`CommandBuilderType`](./CommandBuilderType.md)`): ` [`CommandBuilder`](#)

  Create a new `CommandBuilder` instance from an object definition.

  - `obj` (Type: [`CommandBuilderType`](./CommandBuilderType.md)):

    The `CommandBuilderType` object to process.

  **Returns:** [`CommandBuilder`](#)

**Instance Properties:**

- `name` (Type: `string`):

  The name of the sub-command used when invoking or displayed in help messages.

- `dest` (Type: `string`):

  The destination where the parsed command or sub-command value is placed.

- `aliases` (Type: `string[]`):

  An array of aliases for the command or sub-command.

- `help` (Type: `string`):

  The help message explaining the command or sub-command's purpose.

- `args` (Type: [`CommandArgument`](./CommandArgument.md)`[]`):

  An array of `CommandArgument` instances representing positional arguments.

- `flags` (Type: [`CommandFlag`](./CommandFlag.md)`[]`):

  An array of `CommandFlag` instances representing flags.

- `subcommands` (Type: [`CommandBuilder`](#)`[]`):

  An array of nested `CommandBuilder` instances representing sub-commands.

**Instance Methods:**

- `addAlias(...alias: string[]): this`

  Add one or more aliases for this command or sub-command.

  - `...alias` (Type: `string[]`):

    The aliases to add.

  **Returns:** `this`

- `setHelp(helpText: string): this`

  Set the help message for this command or sub-command.

  - `helpText` (Type: `string`):

    The help text to set.

  **Returns:** `this`

- `addArgument(argument: ` [`CommandArgument`](./CommandArgument.md)`): this`

  Add a positional argument to this command or sub-command.

- `addFlag(flag: ` [`CommandFlag`](./CommandFlag.md)`): this`

  Add a flag to this command or sub-command.

- `addSubCommand(subcommand: ` [`CommandBuilder`](./CommandBuilder.md)`): this`

  Add a sub-command to this command or sub-command.

This documentation offers a comprehensive overview of the `CommandBuilder` class,
equipping you with the knowledge to create custom Minecraft commands. With this
understanding, you can experiment, seek inspiration from real-world examples,
and engage with our supportive community as you embark on your command crafting
journey.
