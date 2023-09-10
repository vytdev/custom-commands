# Command Argument Builder (`CommandArgument`)

The `CommandArgument` class is a fundamental component for defining and managing
arguments in custom commands within the Minecraft server. It offers extensive
customization options, allowing you to tailor arguments precisely to your needs.

**Constructor:**

`CommandArgument(name: string, type: string | ` [`CommandTypeParser`](./CommandTypeParser.md), id?: string)`

Creates a new instance of the `CommandArgument` class, representing an argument
for a custom command.

- `name` (Type: `string`):

  The name of the argument, which will be displayed in help messages.

- `type` (Type: `string | ` [`CommandTypeParser`](./CommandTypeParser.md)):

  The type of the argument, which can be either a string representing a
  predefined type or a custom parser function.

- `id` (Type: `string`, optional):

  An optional identifier used to specify where the parsed argument value is
  placed. If not provided, it defaults to the `name` argument.

**Static Methods:**

- `from(obj: ` [`CommandArgumentType`](./CommandArgumentType.md)`): ` [`CommandArgument`](./CommandArgument.md)

  Creates a new `CommandArgument` instance from an object definition.

  - `obj` (Type: [`CommandArgumentType`]( /CommandArgumentType.md)):

    The `CommandArgumentType` object to process.

  **Returns:** [`CommandArgument`](#)

**Instance Properties:**

- `name` (Type: `string`):

  The name of the argument, displayed in help messages.

- `type` (Type: `string | ` [`CommandTypeParser`](./CommandTypeParser.md)):

  The type of the argument, either a string representing a predefined type or a
  custom parser function.

- `dest` (Type: `string`):

  The destination where the parsed argument value is placed.

- `help` (Type: `string`):

  The help message explaining the argument's purpose.

- `required` (Type: `boolean`)

  Indicates whether this argument is required. `true` by default.

- `default` (Type: `any`)

  The default value for the argument.

- **Custom Attributes** (Type: `any`)

  Additional custom attributes that can be associated with the argument.

**Instance Methods:**

- `setHelp(msg: string): this`

  Sets the help message for this argument.

  - `msg` (Type: `string`):

    The message to set.

  **Returns**: `this`

- `setRequired(val: boolean): this`

  Sets whether this argument is required.

  - `val` (Type: `boolean`):

    The value to set.

  **Returns:** `this`

- `setDefault(val: any): this`

  Sets a default value for this argument.

  - `val` (Type: `any`)

    The default value to set, used when the argument is not provided.

  **Returns:** `this`

- `setAttr(key: string, val: any): this`

  Allows setting custom attributes for this argument.

  - `key` (Type: `string`)

    The name of the attribute to set.

  - `val` (Type: `any`)

    The value to set for the specified key.

  **Returns:** `this`

This documentation provides a comprehensive overview of the `CommandArgument`
class, its properties, and methods. With this knowledge, you can create and
customize arguments for your custom Minecraft commands, enhancing your server's
gameplay.
