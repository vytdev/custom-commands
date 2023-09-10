# CommandToken

This interface defines the structure of command tokens.

## Description

`CommandToken` is an interface that outlines the structure of individual command tokens. Each token represents a distinct part of a command and includes the following properties:

- `text`: The parameter text.
- `start`: The start index of the parameter within the command.
- `end`: The end index of the parameter within the command.
- `quoted`: A flag indicating whether the parameter is enclosed in quotes. 

This structure is employed for parsing and analyzing command input.
