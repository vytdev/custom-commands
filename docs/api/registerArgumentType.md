# registerArgumentType

This function allows you to register custom argument types.

## Description

This is a function that facilitates the registration of custom argument types.
It is crucial for extending the capabilities of your command handling system,
allowing you to define and use specialized argument types. It takes two
parameters:

- `typeName` (string): The name of the custom argument type
- `parser` ([CommandTypeParser](./CommandTypeParser.md)): The parser function
  for the custom type.

## Example

Here's how to use it:

```typescript
import * as cmd from "commands.js";

// register a custom arg type parser
cmd.registerArgumentType(
    // [typeName] the name of the type
    "text",
    // [parser] the function that process the value
    (argv: cmd.CommandToken[], argDef: cmd.CommandArgument) => {
        return {
            value: argv[0].text,
            step: 1, // optional, it is always 1 by default
        }
    }
);
```
