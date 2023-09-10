# tokenizeCommand

This utility function splits a command into tokens for analysis.

## Description

`tokenizeCommand` is a utility function designed to break down a command string
into an array of command tokens. It accepts the following parameters:

- `cmd` (string): The command string to tokenize.
- `startIndex` (optional number): An optional start index, particularly useful
  when a prefix is skipped.

The function returns an array of [`CommandToken`](./CommandToken.md) objects,
simplifying the process of analyzing and processing command input.
