# Command Registry (CommandRegistry)

## Constructor

- **`prefix`** (optional):
  - **Description:** The prefix to use in chat messages. If not provided, this registry and its contained commands won't be available in chats.
  - **Type:** string (optional)

## Instance Properties

- **`prefix`**:
  - **Description:** The current prefix used in chat messages.
  - **Type:** string

## Instance Methods

- **`startService`**:
  - **Description:** Starts the command service for chats with the specified prefix.
  - **Parameters:**
    - **`prefix`**:
      - **Description:** The prefix to use in chat messages.
      - **Type:** string
  - **Returns:** void

- **`stopService`**:
  - **Description:** Stops the command service for chats, if it's active.
  - **Returns:** boolean

- **`getCommand`**:
  - **Description:** Searches for a command in the registry by name or alias.
  - **Parameters:**
    - **`cmd`**:
      - **Description:** The command name or alias to search for.
      - **Type:** string
    - **`alias`** (optional):
      - **Description:** Indicates whether to search for aliases as well.
      - **Type:** boolean (optional)
  - **Returns:** Command

- **`register`**:
  - **Description:** Registers a new command in this registry.
  - **Parameters:**
    - **`info`**:
      - **Description:** Information about the command.
      - **Type:** CommandBuilder or CommandBuilderType
    - **`callback`**:
      - **Description:** The callback function to execute when the command is invoked.
