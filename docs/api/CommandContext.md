# Command Context (CommandContext)

## Constructor

- **`cmd`**:
  - **Description:** The command text being executed.
  - **Type:** string

- **`args`**:
  - **Description:** Parsed arguments for the command.
  - **Type:** ParsedArgs

- **`data`** (optional):
  - **Description:** Additional data, such as sender information.
  - **Type:** ChatSendBeforeEvent (optional)

## Instance Properties

- **`command`**:
  - **Description:** The command text being executed.
  - **Type:** string

- **`args`**:
  - **Description:** Parsed arguments for the command.
  - **Type:** ParsedArgs

- **`sender`**:
  - **Description:** The player who executes the command, can be undefined.
  - **Type:** Player
