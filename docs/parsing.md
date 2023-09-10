# Parsing Conventions

Welcome to the parsing conventions documentation! This guide is designed to
provide you with a comprehensive understanding of how command parsing works
within this Minecraft custom command project.

## Argument Parsing

Let's start with argument parsing, a fundamental aspect of this system:

- Argument parsing is powered by the type parser, which returns an object with
  two essential properties:
  - `value`: This property holds the resulting JavaScript value (required).
  - `step`: Optionally, you can specify the number of `CommandToken` instances
  consumed to process the given argument; the default is 1.
- Keep in mind that each argument can be processed from various inputs, allowing
  for flexibility. An argument can consume more than one `CommandToken`, depending
  on the `CommandTypeParser` function's returned `step` value.
- When it comes to exceptions, any errors thrown by the parser, except for
  instances of `CommandError`, are considered internal errors.

## Flag Parsing

Flag parsing follows specific rules and behaviors:

- Flags come into play only when the `parseFlags` configuration is enabled within
  your `Command` instance.
- You can terminate flags by using a double dash "--" if you've set `breakableFlags`
  to true.
- Java-style parsing is supported, where long flags have only one dash, provided
  you've enabled this by setting `javaFlags` to true.
- Short flags can include equals signs and arguments (e.g., "-f=arg"), but remember
  that only the end letter is processed for arguments.
- By default, flags are treated as boolean, with their arguments processed separately.

Processing Flag Arguments:

- Required flag arguments require explicit processing. For instance, if a flag
  expects two arguments but only one is found with no tokens left, it will
  indicate that more arguments are needed.
- If a flag argument is required and processing fails, an error is thrown,
  including details about why the argument processing failed.
- If the next argument in a flag is optional and processed successfully, the
  argument is stored as part of the flag within the `ParsedArgs` object. In the
  case of failure, the argument is considered part of the parent command or
  sub-command of the flag.

Flag Name and Equals Sign:

- Both long flags (e.g., `--flagName`) and short flags (e.g., `-f`) can include
  equals signs in their names and arguments if specified.
- The "=" character is considered special only when it appears together with the
  flag name (e.g., `--flagName=arg`).
- Trailing whitespace after equal characters is normalized, but leading whitespace
  is not.

## Command/Sub-command Parsing

Moving on to command/sub-command parsing, which allows you to build powerful
command structures:

- Command trees can seamlessly incorporate both arguments and flags, making your
  commands flexible and versatile.
- Flags can be placed alongside their corresponding arguments anywhere within the
  command structure.
- Remember that within a command tree, only one sub-command can be processed.
- The system attempts to match the next argument with a named sub-command. If no
  match is found, it then tries to parse arguments in conjunction with the next
  argument within the collected unnamed sub-commands. If neither approach succeeds,
  an error is thrown.
- Each parsing of unnamed sub-commands results in a separate `ParsedArgs` object,
  which is later merged into the parent result object.
- Sub-commands are processed only when extra tokens are found, and specific
  sub-command parsing rules are defined, aligning with common CLI conventions.

This guide is your go-to resource for mastering command parsing within your Minecraft custom command project. It provides insights into argument and flag parsing, flag behaviors, and the intricacies of command/sub-command parsing, empowering you to create robust and dynamic commands for your Minecraft world. Let's dive in!
