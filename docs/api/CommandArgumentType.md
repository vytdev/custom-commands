# CommandArgumentType

The `CommandArgumentType` interface defines the structure of command arguments.
It helps in organizing and validating input parameters.

## Properties:

- `dest`: Defines where the parsed argument value should be placed.
- `type`: Specifies the expected type of the argument.
- `name` (optional): Displayed name for the argument in help messages.
- `help` (optional): Provides helpful information about the argument.
- `required` (optional): Indicates whether the argument is mandatory.
- `default` (optional): Specifies a default value for the argument.
- **Custom Attributes**: Custom attributes you can pass to the argument parser.
