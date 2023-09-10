# CommandBuilderType

The `CommandBuilderType` interface is your tool for defining and structuring commands and sub-commands.

`interface`

## Properties

- `name`: Identifies the sub-command when invoked or displayed in help.
- `dest`: Indicates where the parsed sub-command value should be placed.
- `aliases` (optional): Provides alternative names for the command/sub-command.
- `help` (optional): Supplies informative context about the command.
- `args` (optional): Specifies the structure of positional arguments.
- `flags` (optional): Lists flags available for this command.
- `subcommands` (optional): Describes sub-commands if any.

# Example

```typescript
```
